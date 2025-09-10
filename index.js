const express = require("express");
const cookie = require("cookie");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
require("dotenv").config();

const app = express();
const cors = require("cors");

// ✅ CORS (frontend & backend are on the same domain now)
app.use(
  cors({
    origin: true, // allow same origin
    credentials: true,
  })
);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

app.use(express.json());

let db; // Mongo database handle

async function start() {
  const client = new MongoClient(MONGO_URI, {
    serverApi: { version: "1", strict: false, deprecationErrors: true },
    connectTimeoutMS: 20000,
  });

  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME || "ABTest");
  console.log("✅ Connected to MongoDB");

  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
}

// Middleware to ensure userId cookie
app.use(async (req, res, next) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    let userId = cookies.userId;
    if (!userId) {
      userId = uuidv4();
      res.setHeader(
        "Set-Cookie",
        `userId=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
          60 * 60 * 24 * 365
        }`
      );
    }
    req.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
});

// Assign or fetch variant
app.post("/api/variant", async (req, res, next) => {
  try {
    const userId = req.userId;
    const users = db.collection("users");
    let user = await users.findOne({ userId });
    if (!user) {
      const variant = Math.random() < 0.5 ? "A" : "B";
      user = { userId, variant, createdAt: new Date() };
      await users.insertOne(user);
    }
    res.json({ userId, variant: user.variant });
  } catch (err) {
    next(err);
  }
});

// Record event
app.post("/api/events", async (req, res, next) => {
  try {
    const { variant, courseId, type, extra } = req.body || {};
    const userId = req.userId;
    if (!variant || !courseId || !type) {
      return res
        .status(400)
        .json({ error: "variant, courseId and type are required" });
    }

    const events = db.collection("events");

    // Ensure exposure is counted once per course per user
    if (type === "exposure") {
      const exists = await events.findOne({
        userId,
        courseId,
        type: "exposure",
      });
      if (exists) {
        return res.json({ ok: true, skipped: true });
      }
    }

    await events.insertOne({
      userId,
      variant,
      courseId,
      type,
      extra: extra || null,
      ts: new Date(),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Record enrollment
app.post("/api/enrollments", async (req, res, next) => {
  try {
    const { variant, courseId } = req.body || {};
    const userId = req.userId;
    if (!variant || !courseId) {
      return res
        .status(400)
        .json({ error: "variant and courseId are required" });
    }

    const enrollments = db.collection("enrollments");
    
    // Check if user already enrolled in this course
    const existingEnrollment = await enrollments.findOne({
      userId,
      courseId,
    });
    
    if (existingEnrollment) {
      return res.json({ ok: true, message: "Already enrolled" });
    }

    await enrollments.insertOne({
      userId,
      variant,
      courseId,
      enrolledAt: new Date(),
    });
    
    res.json({ ok: true, message: "Enrollment recorded" });
  } catch (err) {
    next(err);
  }
});

// Fetch enrollments for analytics
app.get("/api/enrollments", async (req, res, next) => {
  try {
    const enrollments = db.collection("enrollments");
    const all = await enrollments.find({}).sort({ enrolledAt: 1 }).toArray();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// Fetch events for analytics
app.get("/api/events", async (req, res, next) => {
  try {
    const events = db.collection("events");
    const all = await events.find({}).sort({ ts: 1 }).toArray();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// Basic health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ✅ Serve React frontend (after API routes)
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
start().catch((e) => {
  console.error("❌ Failed to start server", e);
  process.exit(1);
});

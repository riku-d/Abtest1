// Database-driven A/B test helpers using backend API
const base = '';

// Robust UUID generator
function getSessionId() {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      sessionId = crypto.randomUUID();
    } else {
      // Fallback UUID v4
      sessionId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = (crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

export async function getOrAssignVariant() {
  const res = await fetch(`${base}/api/variant`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to assign variant');
  const data = await res.json();
  return data.variant;
}

export async function recordEvent({ variant, courseId, type, extra }) {
  const res = await fetch(`${base}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ variant, courseId, type, extra, sessionId: getSessionId() })
  });
  if (!res.ok) throw new Error('Failed to record event');
  return res.json();
}

export async function readEvents() {
  const res = await fetch(`${base}/api/events`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to read events');
  return res.json();
}

export async function recordEnrollment({ variant, courseId }) {
  const res = await fetch(`${base}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ variant, courseId })
  });
  if (!res.ok) throw new Error('Failed to record enrollment');
  return res.json();
}

export async function readEnrollments() {
  const res = await fetch(`${base}/api/enrollments`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to read enrollments');
  return res.json();
}
# 🎯 A/B Testing on Online Course Promotions

## 📌 Project Overview
This project is an **A/B Testing experiment** designed to evaluate the effectiveness of different promotional strategies for online courses.  

Two variants of the website were created:  

- **Variant A (Control):** Regular pricing and course details.  
- **Variant B (Treatment):** Promotional offers (e.g., discounts, highlighted features).  

By tracking user interactions, enrollments, and purchase behavior, the goal is to determine which strategy results in **higher engagement and conversions**.

---

## ⚙️ Tech Stack
- **Frontend:** React.js, Chart.js (for data visualization)  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB Atlas (for storing events and enrollments)  
- **Analytics:** Custom event tracking system with visualization dashboards  

---

🚀 Getting Started

1️⃣ Clone the Repository

`git clone https://github.com/riku-d/Abtest1.git`

`cd Abtest1`

2️⃣ Setup Backend

`npm install`

Create a .env file:

`MONGO_URI=your-mongodb-uri`

`MONGO_DB_NAME="ABTest"`

`PORT=4000`

Run backend:

`npm run server`

3️⃣ Setup Frontend

`cd client`

`npm install`

`npm start`


---

🧪 Usage Guide

1. Start both frontend and backend servers.


2. Open your browser and visit the Control (Variant A) and Treatment (Variant B) versions of the site.


3. Interact with the website (browse courses, click "Buy", enroll).


4. Each action is logged in MongoDB as an event (page view, click, or purchase).


5. Open the Analytics Dashboard to visualize:

Total visits

Click-through rates

Conversion rates

Lift in performance between variants





---

📊 Features

✅ User Session Tracking – Logs visits, clicks, and course enrollments

✅ Event Recording – Each user interaction is stored in MongoDB

✅ Data Visualization – Dashboard with bar charts, line charts, and doughnut charts

✅ Hypothesis Testing – Compare conversion rates between control & treatment

✅ Insights Generation – Identify which variant performs better



---

📈 Metrics Tracked

Click-Through Rate (CTR) = Clicks ÷ Impressions

Conversion Rate (CR) = Purchases ÷ Visitors

Lift in Conversions = (CR(B) - CR(A)) ÷ CR(A)



---

📌 Future Improvements

📦 Add statistical significance testing (t-test, chi-square)

📊 Integrate with Google Analytics or Mixpanel

🤖 Use ML models to predict best-performing variants

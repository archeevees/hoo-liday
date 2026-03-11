console.log("hoo-liday is running on Docker!");

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE
app.use(express.json()); 

// 2. DATABASE CONNECTION
console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "Label found in .env" : "MISSING LABEL IN .env!");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 
})
  .then(() => console.log("✅ SUCCESS: Connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("❌ DATABASE ERROR TYPE:", err.name);
    console.error("❌ MESSAGE:", err.message);
  });

// 3. DATABASE SCHEMA
const holidaySchema = new mongoose.Schema({
  staffName: String,
  staffId: String,
  holidayDate: String, // The date they picked from the calendar
  reason: String,      // Their reasoning
  applyDate: { type: Date, default: Date.now }, 
  createdAt: { type: Date, expires: '30d', default: Date.now }
});

const Holiday = mongoose.model('Holiday', holidaySchema);

// 4. ROUTES

// Root check
app.get('/', (req, res) => res.send("API is running and connected to DB."));

// Get Status: Tells React how many slots are taken THIS WEEK
app.get('/api/status', async (req, res) => {
  try {
    const now = new Date();
    // Calculate last Monday 7AM MYT (Sunday 23:00 UTC)
    const lastMonday = new Date();
    lastMonday.setUTCHours(23, 0, 0, 0);
    lastMonday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    if (now < lastMonday) lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);

    const weeklyCount = await Holiday.countDocuments({
      applyDate: { $gte: lastMonday }
    });

    res.json({ count: weeklyCount });
  } catch (err) {
    res.status(500).json({ error: "Database not reachable" });
  }
});

// Apply Logic: The Smart Gatekeeper
app.post('/api/apply', async (req, res) => {
  try {
    const now = new Date();
    
    // Step A: Calculate the Reset Point (Last Monday 7:00 AM Malaysia Time)
    const lastMonday = new Date();
    lastMonday.setUTCHours(23, 0, 0, 0); // 23:00 UTC Sunday = 07:00 MYT Monday
    lastMonday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    
    // If it's currently Sunday before 11PM UTC, the 'lastMonday' was actually 6 days ago
    if (now < lastMonday) {
        lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
    }

    // Step B: Count only the applications from THIS week
    const weeklyCount = await Holiday.countDocuments({
      applyDate: { $gte: lastMonday }
    });

    // Step C: Check if slots for this week are full
    if (weeklyCount >= 5) {
      return res.status(403).json({ 
        message: "Slots full for this week! Please try again next Monday at 7:00 AM." 
      });
    }

    // Step D: Save the application (Kept for 30 days automatically)
    const newHoliday = new Holiday({
      staffName: req.body.name,
      staffId: req.body.id,
      applyDate: now 
    });

    await newHoliday.save();
    res.status(200).json({ message: "Holiday applied successfully!" });

  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Server Error. Please try again." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
console.log("hoo-liday is running on Docker!");

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE: Allows the server to read the "Name" and "ID" sent from React
app.use(express.json()); 

// 2. DATABASE CONNECTION: Added a 5-second timeout to prevent silent hanging
console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "Label found in .env" : "MISSING LABEL IN .env!");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 
})
  .then(() => console.log("✅ SUCCESS: Connected to MongoDB Atlas!"))
  .catch((err) => {
    console.error("❌ DATABASE ERROR TYPE:", err.name);
    console.error("❌ MESSAGE:", err.message);
  });

// 3. DATABASE SCHEMA: Defining what a "Holiday" looks like
const holidaySchema = new mongoose.Schema({
  staffName: String,
  staffId: String,
  applyDate: { type: Date, default: Date.now },
  // Automatically delete the record after 30 days
  createdAt: { type: Date, expires: '30d', default: Date.now }
});

const Holiday = mongoose.model('Holiday', holidaySchema);

// 4. ROUTES

// Root check
app.get('/', (req, res) => res.send("API is running and connected to DB."));

// Get Status: Tells React how many slots are taken
app.get('/api/status', async (req, res) => {
  try {
    const count = await Holiday.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Database not reachable" });
  }
});

// Apply Logic: The Gatekeeper
app.post('/api/apply', async (req, res) => {
  try {
    const now = new Date();
    const day = now.getUTCDay();   // 0=Sun, 1=Mon
    const hour = now.getUTCHours(); 

    // TIME LOCK: Opens Monday 07:00 AM Malaysia (Sunday 23:00 UTC)
    const isMondayAfterSeven = (day === 1) || (day === 0 && hour >= 23);
    
    // TEMPORARY: Comment out the next 3 lines if you want to test on a Thursday!
    if (!isMondayAfterSeven) {
       return res.status(403).json({ message: "Closed! Applications open Monday at 7:00 AM." });
    }

    // SLOT LIMIT: Only allow first 5
    const count = await Holiday.countDocuments();
    if (count >= 5) {
      return res.status(403).json({ message: "Slots full! All 5 holidays have been taken." });
    }

    // SAVE TO DB
    const newHoliday = new Holiday({
      staffName: req.body.name,
      staffId: req.body.id
    });

    await newHoliday.save();
    res.status(200).json({ message: "Holiday applied successfully!" });

  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Server Error. Please try again." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
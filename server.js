console.log("hoo-liday is running on Docker!");

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get('/', (req, res) => res.send("API is running and connected to DB."));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//creating logic
//Is it after Monday 07:00 AM? | Are there fewer than 5 applications already? | Is the user a valid staff member?

const holidaySchema = new mongoose.Schema({
  staffName: String,
  staffId: String,
  applyDate: { type: Date, default: Date.now },
  // This 'createdAt' field will automatically delete the record after 30 days
  createdAt: { type: Date, expires: '30d', default: Date.now }
});

const Holiday = mongoose.model('Holiday', holidaySchema);

//applying logic, first 5 & reset

app.post('/apply', async (req, res) => {
  const now = new Date();
  
  // 1. Check if it's Monday 07:00 AM Malaysia Time (UTC+8)
  // Note: Server time is usually UTC. Monday 07:00 MYT is Sunday 23:00 UTC.
  const day = now.getUTCDay(); // 0 is Sunday, 1 is Monday
  const hour = now.getUTCHours();

  // If it's Sunday before 23:00 UTC, it's not yet Monday 07:00 MYT
  // This is a simple version; we can refine this!
  if (day === 0 && hour < 23) {
    return res.status(403).json({ message: "Applications open on Monday at 07:00 AM." });
  }

  // 2. Count current applications for this week
  const count = await Holiday.countDocuments();

  if (count >= 5) {
    return res.status(403).json({ message: "Slots full! All 5 holidays have been taken." });
  }

  // 3. Save the application
  const newHoliday = new Holiday({
    staffName: req.body.name,
    staffId: req.body.id
  });

  await newHoliday.save();
  res.status(200).json({ message: "Holiday applied successfully!" });
});
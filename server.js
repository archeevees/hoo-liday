console.log("hoo-liday is running on Docker!");

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 

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
  const day = now.getUTCDay();   // 0=Sun, 1=Mon... 4=Thu
  const hour = now.getUTCHours(); 

  // STRICT LOCK: Only allow if Day is Monday (1) AND Hour is >= 07:00 (UTC 23:00 Sun)
  // For testing on a Thursday, you might want to comment this out!
  const isMondayAfterSeven = (day === 1 && hour >= 0) || (day === 0 && hour >= 23);
  
  if (!isMondayAfterSeven) {
     // For now, let's just log it so you can see it in Docker logs
     console.log("Attempted access outside of window");
     // return res.status(403).json({ message: "Closed! Opens Monday 7AM." });
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

app.get('/api/status', async (req, res) => {
  const count = await Holiday.countDocuments();
  res.json({ count });
});
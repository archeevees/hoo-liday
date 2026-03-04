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
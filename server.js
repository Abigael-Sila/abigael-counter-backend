// visitor-counter-backend/server.js
require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Use port from environment variable or default to 3001

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI; // Your MongoDB Atlas connection string

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true, // Deprecated in recent versions but good practice to include
  useUnifiedTopology: true // Deprecated in recent versions but good practice to include
})
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema and Model for View Count ---
const visitorCountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'website_views'
  count: { type: Number, default: 0 }
});
const VisitorCount = mongoose.model('VisitorCount', visitorCountSchema);

// --- Middleware ---
app.use(express.json()); // For parsing JSON request bodies

// Configure CORS
// IMPORTANT: Replace 'https://your-github-username.github.io' with your actual frontend domain!
// This is the URL where your React portfolio website is hosted on GitHub Pages.
const corsOptions = {
  origin: 'https://abigael-sila.github.io/Abigael-Portfolio-Website/', // Example: Replace with your actual GitHub Pages URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// --- API Routes ---

// Endpoint to increment view count
app.post('/api/increment-view', async (req, res) => {
  try {
    const counter = await VisitorCount.findOneAndUpdate(
      { name: 'website_views' }, // Find the counter document
      { $inc: { count: 1 } },     // Increment its 'count' field by 1
      { upsert: true, new: true } // Create if not exists (upsert), return the new document (new: true)
    );
    res.json({ success: true, count: counter.count });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Optional: Endpoint to get current view count without incrementing
app.get('/api/views', async (req, res) => {
  try {
    const counter = await VisitorCount.findOne({ name: 'website_views' });
    res.json({ count: counter ? counter.count : 0 });
  } catch (error) {
    console.error('Error fetching view count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
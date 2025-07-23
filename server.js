// visitor-counter-backend/server.js

// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Use the PORT from environment variables, or default to 3001 for local development
const PORT = process.env.PORT || 3001; 

// --- Database Connection ---
// Your MongoDB Atlas connection string is loaded from the MONGODB_URI environment variable
const MONGODB_URI = process.env.MONGODB_URI; 

mongoose.connect(MONGODB_URI, {
  // These options are for compatibility and are good practice to include,
  // though they might be deprecated in very recent Mongoose versions.
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB Connected!')) // Log success message on successful connection
.catch(err => console.error('MongoDB connection error:', err)); // Log error on connection failure

// --- Mongoose Schema and Model for View Count ---
// Defines the structure for our visitor count document in MongoDB
const visitorCountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'website_views' will be used as the name
  count: { type: Number, default: 0 } // Stores the actual count, defaults to 0
});
const VisitorCount = mongoose.model('VisitorCount', visitorCountSchema);

// --- Middleware ---
// Express middleware to parse incoming JSON request bodies
app.use(express.json()); 

// counter-backend/server.js

// ... (rest of your code) ...

// Configure CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  // Allow specific origins. Add all domains your frontend might be hosted on.
  origin: [
    'https://abigael-sila.github.io', // Base GitHub Pages domain for your user/org pages
    'https://abigael-sila.github.io/Abigael-Portfolio-Website', // Your specific repo page
    'http://abigaelsilakalundesila.com', // Your custom domain (if applicable)
    'https://abigaelsilakalundesila.com', // Your custom domain with HTTPS (if applicable)
    'http://localhost:3000', // For local development of your frontend (adjust port if different)
    'http://localhost:5173' // Another common local dev server port (e.g., Vite)
  ],
  optionsSuccessStatus: 200 // For older browsers compatibility
};
app.use(cors(corsOptions));

// ... (rest of your code) ...
// --- API Routes ---

// 1. Root Route (Optional but Recommended for Status Check)
// When someone visits the base URL of your deployed backend (e.g., https://your-backend-app.onrender.com/),
// this route will return a simple message, indicating the server is running.
app.get('/', (req, res) => {
  res.send('Abigael Counter Backend API is running!');
  // Alternatively, send JSON: res.json({ message: 'Abigael Counter Backend API is running!' });
});

// 2. Endpoint to Increment View Count
// This route handles POST requests from your frontend to increment the website view count.
app.post('/api/increment-view', async (req, res) => {
  try {
    // Find the document named 'website_views' and increment its 'count' field by 1.
    // 'upsert: true' means if the document doesn't exist, it will create it.
    // 'new: true' ensures that the returned 'counter' object is the updated one.
    const counter = await VisitorCount.findOneAndUpdate(
      { name: 'website_views' }, 
      { $inc: { count: 1 } },     
      { upsert: true, new: true } 
    );
    // Respond with success status and the new count
    res.json({ success: true, count: counter.count });
  } catch (error) {
    // Log and send a server error response if something goes wrong
    console.error('Error incrementing view count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Optional: Endpoint to Get Current View Count (without incrementing)
// This route handles GET requests if you ever need to just retrieve the count without modifying it.
app.get('/api/views', async (req, res) => {
  try {
    // Find the 'website_views' document
    const counter = await VisitorCount.findOne({ name: 'website_views' });
    // Respond with the current count, or 0 if the document doesn't exist yet
    res.json({ count: counter ? counter.count : 0 });
  } catch (error) {
    // Log and send a server error response
    console.error('Error fetching view count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Start Server ---
// Make the Express app listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
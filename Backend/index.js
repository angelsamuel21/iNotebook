// index.js
// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import the MongoDB connection function
const connectToDatabase = require('./db');

// Import Express and other necessary middleware
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Import helmet

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

async function startServer() {
  // Connect to MongoDB Atlas and wait for it to complete
  console.log("Connecting to MongoDB...");
  await connectToDatabase(); // Ensure DB is connected before starting server

  // Middleware
  app.use(helmet()); // Use helmet for security headers
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
  }));
  app.use(express.json()); // To parse JSON request bodies

  // Routes
  // Consider organizing auth-related routes under a single main router for /api/auth
  // if there's overlap or for better structure.
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/auth", require("./routes/getUser"));
  app.use("/api/auth", require("./routes/resetPassword"));   // This line requires resetPassword.js to export a router
  app.use("/api/notes", require("./routes/notes"));
  app.use("/api/auth", require("./routes/verifyOtp"));       // This line requires verifyOtp.js to export a router

  // Test route
  app.get("/", (req, res) => {
    res.send("Welcome to the iNotebook Backend API! Ready to take notes.");
  });

  // Start the server
  app.listen(port, () => {
    console.log(`✅ Server listening on port ${port}`);
  });
}

startServer().catch(error => {
  console.error("❌ Failed to start the server:", error);
  process.exit(1); // Exit if server fails to start (e.g., DB connection fails)
});

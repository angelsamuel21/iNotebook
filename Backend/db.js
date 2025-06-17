// db.js
// Import the mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Load the MongoDB connection URI from environment variables
const mongoURI = process.env.MONGO_URI;

/**
 * Connects to the MongoDB database using mongoose.
 * Logs a success message on successful connection.
 * Logs an error and exits if connection fails.
 */
const connectToMongo = async () => {
  try {
    // Check if URI is set in environment
    if (!mongoURI) {
      console.error("❌ MONGO_URI not found in environment variables.");
      process.exit(1); // Exit if no URI
    }

    // Attempt to connect
    await mongoose.connect(mongoURI);

    console.log("✅ Connected to MongoDB successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit on failure
  }
};

// Optional log for when db.js is loaded
console.log("🔄 db.js loaded, ready to connect to MongoDB.");

// Export the function to use in other parts of the app
module.exports = connectToMongo;
// This code connects to a MongoDB database using Mongoose.
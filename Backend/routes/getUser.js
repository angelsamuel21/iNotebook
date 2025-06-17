// routes/getUser.js
// Route to fetch user data using JWT authentication middleware

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchUser = require("../middleware/fetchUser");

// Route 1: GET /api/auth/getuser - Get logged-in user's data
// Requires 'auth-token' header with a valid JWT
router.get("/getuser", fetchUser, async (req, res) => {
  console.log("GET /api/auth/getuser called");
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User details fetched:", user);
    res.status(200).json({ message: "User details fetched", user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error fetching user details" });
  }
});

module.exports = router;

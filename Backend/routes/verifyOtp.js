const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP is valid, update user record
    user.otpVerified = true; // Mark OTP as verified
    user.otp = undefined; // Clear the OTP so it cannot be reused
    user.otpExpiry = undefined; // Clear OTP expiry
    try {
      const savedUser = await user.save();
      console.log(`[verifyOtp] User ${savedUser.email} after save. otpVerified status: ${savedUser.otpVerified}, User ID: ${savedUser._id}`);
      
      // For extra assurance, re-fetch the user by ID immediately after saving
      const freshlyFetchedUser = await User.findById(savedUser._id);
      if (freshlyFetchedUser) {
        console.log(`[verifyOtp] User ${freshlyFetchedUser.email} RE-FETCHED BY ID. otpVerified status: ${freshlyFetchedUser.otpVerified}`);
        if (!freshlyFetchedUser.otpVerified) {
            console.error("[verifyOtp] CRITICAL: Re-fetched user shows otpVerified as false immediately after save!");
        }
      } else {
        console.error("[verifyOtp] CRITICAL: Failed to re-fetch user by ID immediately after save!");
      }

      return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } catch (saveError) {
      console.error("[verifyOtp] Error during user.save():", saveError);
      // It's important to let the frontend know if the save failed
      return res.status(500).json({ success: false, message: "Failed to save OTP verification status." });
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: "Server error during OTP verification process" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendOtpEmail = require("../utils/sendOtpEmail");
const rateLimit = require("express-rate-limit");

// Generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Rate limiter for sending OTPs
// Allow 3 requests per email per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP/email to 3 requests per windowMs
  message: {
    success: false,
    message: "Too many OTP requests, please try again after 15 minutes.",
  },
  keyGenerator: (req, res) => {
    // Use email as the key for rate limiting
    // Ensure email is present in the body, otherwise, it might fall back to IP
    return req.body.email || req.ip;
  },
  handler: (req, res, next, options) =>
    res.status(options.statusCode).json(options.message),
});
// 🔹 STEP 1: Send OTP route
router.post("/send-otp", otpLimiter, async (req, res) => {
  // Apply the limiter here
  try {
    console.log(`[sendOtp] Received request for email: ${req.body.email}`); // Log when this route is hit
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpVerified = false; // Reset verification status when sending a new OTP
    await user.save();

    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      const errorMessage = emailResult.error
        ? `Failed to send OTP email: ${emailResult.error}`
        : "Failed to send OTP email";
      return res.status(500).json({ success: false, message: errorMessage });
    }

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 STEP 2: Reset Password (after OTP is verified)
// This route requires that the OTP has been successfully verified via /api/auth/verify-otp
// Alternatively, this route could also take the OTP and verify it again.
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body; // OTP might also be passed if verifying here

    console.log(
      `[resetPassword] Attempting to reset password for email: ${email}`
    );
    // Avoid logging plaintext passwords in production.
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[resetPassword] DEV_ONLY: Plaintext newPassword received: "${newPassword}"`
      );
    }

    const user = await User.findOne({ email });
    console.log(
      `[resetPassword] User ${email} fetched. otpVerified status: ${
        user ? user.otpVerified : "User not found"
      }`
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Ensure OTP was verified for this user.
    // The `user.otpVerified` flag is set to true in the /api/auth/verify-otp route.
    if (!user.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt); // Store in a new var for logging
    console.log(
      `[resetPassword] New hashed password generated: "${newHashedPassword}"`
    );

    user.password = newHashedPassword; // Assign the new hash
    user.otp = undefined; // Clear OTP
    user.otpExpiry = undefined; // Clear OTP expiry
    user.otpVerified = false; // Reset OTP verification status after successful password change

    try {
      await user.save();
      console.log(
        `[resetPassword] User ${email} saved successfully with new password.`
      );
      // The log above confirms the save. Re-fetching and logging the password again
      // can be removed for production to reduce verbosity.
    } catch (saveError) {
      console.error(
        `[resetPassword] Error saving user ${email} after password update:`,
        saveError
      );
      return res.status(500).json({
        success: false,
        message: "Server error: Could not save new password.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset" });
  }
});

module.exports = router;

// Import Express and create a router
const express = require("express");
// Import validation utilities from express-validator
const { body, validationResult } = require("express-validator");
// Import bcryptjs for password hashing
const bcrypt = require("bcryptjs");
// Import jsonwebtoken for JWT auth
const jwt = require("jsonwebtoken");
// Import User model
const User = require("../models/User");
// Import fetchUser middleware
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();

// Load JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; // Default to 1 hour if not set

// Critical check for JWT_SECRET
const placeholderJwtSecret = "YOUR_NEW_STRONG_UNIQUE_SECRET_KEY_REPLACE_THIS";
if (!JWT_SECRET || JWT_SECRET === placeholderJwtSecret || JWT_SECRET.length < 32) {
  console.error("FATAL ERROR: JWT_SECRET is not defined, is too short (minimum 32 characters), or is using an insecure placeholder value.");
  console.error("Please set a strong, unique secret for JWT_SECRET in your .env file.");
  process.exit(1); // Exit application if JWT_SECRET is not secure
}

// Route 1: GET /api/auth - Check if the Auth API is working
router.get("/", (req, res) => {
  console.log("GET /api/auth called");
  res.status(200).json({ message: "Auth API is working" });
});

// Route 2: POST /api/auth/createuser - Register a new user
// Validates name, email, and password fields
// Ensures email is unique (cannot register with an already registered email)
// Returns a JWT token on successful registration
router.post(
  "/createuser",
  [
    // Validation middleware for request body
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    console.log("POST /api/auth/createuser called with body:", req.body);
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors if any
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check for existing user with the same email
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        // Return error if user already exists
        console.error("User with this email already exists");
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      // Hash the password with salt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // Create a new user instance with hashed password
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      // Save the new user to the database
      await user.save();
      // Generate JWT token
      const payload = { user: { id: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      console.log("User saved to MongoDB:", user);

      // Prepare user data for response, excluding password
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      // Respond with success message, auth token, and user data
      res.status(201).json({
        message: "User created successfully",
        authToken,
        user: userResponse,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ message: "Internal server error during user creation" });
    }
  }
);

//  POST route for /api/auth/login - User login
router.post(
  "/login",
  [
    body("email", "Valid email is required").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    console.log("POST /api/auth/login called with body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    console.log(`[login] Attempting login for email: ${email}`);
    // Avoid logging plaintext passwords in production.
    if (process.env.NODE_ENV === "development") {
      console.log(`[login] DEV_ONLY: Plaintext password received: "${password}"`);
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.error(`[login] User not found for email: ${email}`);
        return res.status(400).json({ error: "Please check your credentials" });
      }
      console.log(`[login] Stored hashed password for ${email}: "${user.password}"`);

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`[login] bcrypt.compare result for ${email}: ${isMatch}`);
      if (!isMatch) {
        console.error(`[login] Password mismatch for email: ${email}`);
        return res.status(400).json({ error: "Invalid credentials" });
      }
      const payload = { user: { id: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      console.log("User logged in:", user);
      // Only return token and message, not user details
      res.status(200).json({ message: "Login successful", authToken });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error during login" });
    }
  }
);

// Route 3: PUT /api/auth/updateprofile - Update user's profile information (e.g., name)
// Requires JWT authentication
router.put(
  "/updateprofile",
  fetchUser, // Middleware to get user from JWT
  [
    body("name").notEmpty().withMessage("Name cannot be empty").trim(),
    // Add more fields to update here if needed, e.g., body("newEmail").isEmail()
  ],
  async (req, res) => {
    console.log("PUT /api/auth/updateprofile called for user:", req.user.id, "with body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors for updateprofile:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const updatedFields = {};
      if (name) updatedFields.name = name;
      // Add other updatable fields here:
      // if (newEmail) updatedFields.email = newEmail; // Handle email change carefully (verify uniqueness, etc.)

      if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: "No fields to update provided." });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updatedFields },
        { new: true } // Return the updated document
      ).select("-password"); // Exclude password from the returned object

      if (!user) {
        console.error("User not found for updateprofile:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("User profile updated successfully:", user);
      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error during profile update" });
    }
  }
);

// Route 4: POST /api/auth/changepassword - Change user's password
// Requires JWT authentication and current password
router.post(
  "/changepassword",
  fetchUser,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    console.log("POST /api/auth/changepassword called for user:", req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors for changepassword:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        console.error("User not found for changepassword:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.warn("Current password does not match for user:", req.user.id);
        return res.status(400).json({ message: "Incorrect current password" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      console.log("Password changed successfully for user:", req.user.id);
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error during password change" });
    }
  }
);

// Export the router to be used in the main application
module.exports = router;

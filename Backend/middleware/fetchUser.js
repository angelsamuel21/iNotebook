// middleware/fetchUser.js
// Middleware to verify JWT and fetch user from token

const jwt = require("jsonwebtoken");
// Use environment variable for JWT secret in production
const JWT_SECRET = process.env.JWT_SECRET || "your_default_fallback_secret_key"; 

module.exports = function fetchUser(req, res, next) {
  // Get token from header
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

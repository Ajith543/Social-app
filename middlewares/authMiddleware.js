// Server/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token

      // ✅ Fetch user without password field
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next(); // ✅ Continue to next middleware or controller
    } catch (error) {
      console.error("❌ JWT error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // ❌ No token found at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { protect };

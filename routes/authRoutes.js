const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
router.post("/register", asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    token: generateToken(user.id),
  });
}));

// Login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
}));

module.exports = router;

// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  bio: String,
  avatar: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

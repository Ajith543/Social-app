const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["like", "comment", "follow", "message"], required: true },
  message: { type: String },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

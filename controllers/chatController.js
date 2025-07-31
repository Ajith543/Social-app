const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");

exports.sendMessage = asyncHandler(async (req, res) => {
  console.log("🟡 Incoming message request body:", req.body);
  console.log("🔐 Authenticated user:", req.user);

  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    console.log("❌ Missing receiverId or content");
    res.status(400);
    throw new Error("Receiver ID and content are required");
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  console.log("✅ Message created:", message);

  // ✅ Emit message to receiver via Socket.IO
  try {
    const io = req.app.get("io"); // Get socket instance from app
    io.to(receiverId.toString()).emit("newMessage", message);
    console.log(`📤 Message emitted to receiver: ${receiverId}`);
  } catch (emitError) {
    console.error("⚠️ Socket.IO emit failed:", emitError.message);
  }

  res.status(201).json(message);
});

exports.getMessages = asyncHandler(async (req, res) => {
  console.log("📥 Getting messages for:", req.user._id, "and", req.params.userId);

  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  console.log("✅ Found messages:", messages.length);

  res.status(200).json(messages);
});

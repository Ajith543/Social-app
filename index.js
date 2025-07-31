const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/messageModel");
const app = express();
const server = http.createServer(app);
const notificationRoutes = require("./routes/notificationRoutes");

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

//===notification==//
app.use("/api/notifications", notificationRoutes);

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === API ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", chatRoutes);

// ✅ Socket.IO logic
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // ✅ FIXED sendMessage
  socket.on("sendMessage", async (message) => {
    try {
      const newMessage = await Message.create(message);

      const receiverSocketId = onlineUsers.get(message.receiver);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);

        io.to(socket.id).emit("messageStatus", {
          receiverId: message.receiver,
          status: "Delivered",
        });
      } else {
        io.to(socket.id).emit("messageStatus", {
          receiverId: message.receiver,
          status: "Sent",
        });
      }
    } catch (err) {
      console.error("❌ Message saving failed:", err.message);
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("seenMessage", ({ senderId, receiverId }) => {
    const senderSocketId = onlineUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatus", {
        receiverId,
        status: "Seen",
      });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("❌ User disconnected:", socket.id);
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// backend/controllers/notificationController.js
const Notification = require("../models/notificationModel");

// GET /api/notifications/:id - Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    const notifications = await Notification.find({ toUser: userId })
      .populate("fromUser", "username avatar")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/notifications/read/:id - Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.id;
    await Notification.updateMany({ toUser: userId }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// createNotification function to call when actions like follow, comment, message happen
exports.createNotification = async (fromUser, toUser, type, message, postId = null) => {
  try {
    if (fromUser.toString() === toUser.toString()) return; // Avoid self-notification
    const notification = new Notification({
      fromUser,
      toUser,
      type,
      message,
      post: postId,
    });
    await notification.save();
  } catch (err) {
    console.log("Notification Error:", err.message);
  }
};

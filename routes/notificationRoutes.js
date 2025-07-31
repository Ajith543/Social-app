const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/notifications/:id
// @desc    Get all notifications for a user
// @access  Private
router.get("/:id", protect, getNotifications);

// @route   PUT /api/notifications/read/:id
// @desc    Mark all notifications as read
// @access  Private
router.put("/read/:id", protect, markAllAsRead);

module.exports = router;

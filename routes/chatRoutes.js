const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware"); // ✅ Fixed here

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getMessages);

module.exports = router;

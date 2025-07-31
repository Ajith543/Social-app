const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  followUser,
  isFollowing,
  getAllUsers,
} = require("../controllers/userController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// ✅ GET all users (excluding self) — moved to top
router.get("/all", protect, getAllUsers);

// ✅ GET logged-in user profile
router.get("/me", protect, getProfile);

// ✅ PUT update user profile (with image upload support)
router.put("/me", protect, upload.single("avatar"), updateProfile);

// ✅ Follow / Unfollow user
router.post("/:id/follow", protect, followUser);

// ✅ Check if current user is following target user
router.get("/:id/is-following", protect, isFollowing);

module.exports = router;

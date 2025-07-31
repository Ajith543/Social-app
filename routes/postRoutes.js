const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createPost,
  getAllPosts,
  getPostsByUser,
  addComment,
  toggleLike,
  getLikesInfo,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const { createNotification } = require("../controllers/notificationController"); // ✅ Import notification

// 📦 Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// ✅ Routes

// Create post
router.post("/", protect, upload.single("image"), createPost);

// Get all posts
router.get("/", getAllPosts);

// Get posts by user
router.get("/user/:userId", getPostsByUser);

// Add comment and send notification
router.post("/:postId/comments", protect, async (req, res, next) => {
  try {
    const response = await addComment(req, res);
    if (response && response.post) {
      const postOwner = response.post.user;
      if (postOwner.toString() !== req.user._id.toString()) {
        await createNotification(
          req.user._id,
          postOwner,
          "comment",
          "commented on your post",
          response.post._id
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

// Toggle like and send notification
router.post("/:postId/like", protect, async (req, res, next) => {
  try {
    const response = await toggleLike(req, res);
    if (response && response.liked && response.post) {
      const postOwner = response.post.user;
      if (postOwner.toString() !== req.user._id.toString()) {
        await createNotification(
          req.user._id,
          postOwner,
          "like",
          "liked your post",
          response.post._id
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

// Like info
router.get("/:postId/likes", protect, getLikesInfo);

// Delete post
router.delete("/:postId", protect, deletePost);

module.exports = router;

const Post = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const path = require("path");

// ✅ Create a new post
exports.createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  if (!req.file || !caption) {
    res.status(400);
    throw new Error("Image and caption are required");
  }

  const post = await Post.create({
    caption,
    image: req.file.filename,
    user: req.user._id,
  });

  res.status(201).json(post);
});

// ✅ Get all posts with populated user and comments
exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "name avatar")
    .populate("comments.user", "name avatar");

  res.status(200).json({ posts });
});

// ✅ Get posts by a specific user
exports.getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar")
    .populate("comments.user", "name avatar");

  res.status(200).json(posts);
});

// ✅ Add a comment
exports.addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.comments.push({ user: req.user._id, text });
  await post.save();
  await post.populate("comments.user", "name avatar");

  res.status(201).json(post.comments);
});

// ✅ Toggle like
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = req.user._id;
  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json({
    message: alreadyLiked ? "Unliked" : "Liked",
    likeCount: post.likes.length,
  });
});

// ✅ Get like info
exports.getLikesInfo = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate(
    "likes",
    "name username avatar"
  );

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.status(200).json({
    likeCount: post.likes.length,
    likedBy: post.likes.map((user) => ({
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      
    })),
  });
});
// ✅ Delete a post (only owner can delete)
exports.deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Check if the post belongs to the logged-in user
  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this post");
  }

  await post.deleteOne();

  res.status(200).json({ message: "Post deleted successfully" });
});

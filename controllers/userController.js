const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// ------------------- Get Current User Profile -------------------
// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

// ------------------- Update Current User Profile -------------------
// @desc    Update logged-in user profile (name, bio, avatar)
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, bio } = req.body;

  if (name) user.name = name;
  if (bio) user.bio = bio;

  // Handle avatar upload
  if (req.file) {
    user.avatar = req.file.filename;
  }

  const updatedUser = await user.save();

  const avatarUrl = user.avatar
    ? `${req.protocol}://${req.get("host")}/uploads/${user.avatar}`
    : null;

  const { password, ...rest } = updatedUser._doc;

  res.status(200).json({ ...rest, avatar: avatarUrl });
});

// ------------------- Follow or Unfollow User -------------------
// @desc    Follow or Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow) {
    res.status(404);
    throw new Error("User not found");
  }

  if (userToFollow._id.equals(currentUser._id)) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const isFollowing = currentUser.following.includes(userToFollow._id);

  if (isFollowing) {
    // Unfollow
    currentUser.following.pull(userToFollow._id);
    userToFollow.followers.pull(currentUser._id);
  } else {
    // Follow
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
  }

  await currentUser.save();
  await userToFollow.save();

  res.status(200).json({
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    following: currentUser.following,
    followers: userToFollow.followers,
  });
});

// ------------------- Check Follow Status -------------------
// @desc    Check if current user is following a user
// @route   GET /api/users/:id/is-following
// @access  Private
exports.isFollowing = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  if (!currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const targetUserId = req.params.id;
  const isFollowing = currentUser.following.includes(targetUserId);

  res.status(200).json({ isFollowing });
});

// ------------------- Get All Users -------------------
// @desc    Get all users except current logged-in user
// @route   GET /api/users
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
  res.status(200).json(users);
});

// ------------------- Get All Users (Admin Access or Debug) -------------------
// @desc    Get all users (including current)
// @route   GET /api/users/all
// @access  Private
exports.getAllUsersIncludingMe = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

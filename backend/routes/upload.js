const express = require("express");
const router = express.Router();
const { uploadResume, uploadAvatar } = require("../config/cloudinary");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// @route   POST /api/upload/resume
// @access  Private
router.post("/resume", protect, uploadResume.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Save URL to user profile
    await User.findByIdAndUpdate(req.user._id, {
      "profile.resume": req.file.path,
    });

    res.json({
      success: true,
      message: "Resume uploaded successfully!",
      url: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// @route   POST /api/upload/avatar
// @access  Private
router.post("/avatar", protect, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Save URL to user profile
    await User.findByIdAndUpdate(req.user._id, {
      "profile.avatar": req.file.path,
    });

    res.json({
      success: true,
      message: "Avatar uploaded successfully!",
      url: req.file.path,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
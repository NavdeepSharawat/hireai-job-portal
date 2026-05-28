const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password, role: role || "jobseeker" });
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        company: user.company,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    // Get user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        company: user.company,
        savedJobs: user.savedJobs,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs", "title companyName location jobType");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, profile, company } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (profile && user.role === "jobseeker") {
      user.profile = { ...user.profile.toObject(), ...profile };
    }
    if (company && user.role === "recruiter") {
      user.company = { ...user.company.toObject(), ...company };
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: "Profile updated!", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();
    const token = generateToken(user._id);

    res.json({ success: true, message: "Password changed successfully!", token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Save / Unsave a job
// @route   PUT /api/auth/saved-jobs/:jobId
// @access  Private (jobseeker)
exports.toggleSaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;
    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save({ validateBeforeSave: false });
    res.json({
      success: true,
      message: isSaved ? "Job removed from saved." : "Job saved!",
      savedJobs: user.savedJobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

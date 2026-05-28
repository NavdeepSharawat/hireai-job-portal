const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["jobseeker", "recruiter"],
      default: "jobseeker",
    },
    // Job Seeker Profile
    profile: {
      bio: { type: String, maxlength: 500 },
      skills: [{ type: String }],
      experience: { type: String, enum: ["fresher", "1-2 years", "3-5 years", "5+ years"] },
      location: { type: String },
      resume: { type: String }, // URL
      avatar: { type: String },
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
    },
    // Recruiter Profile
    company: {
      name: { type: String },
      website: { type: String },
      description: { type: String },
      logo: { type: String },
      industry: { type: String },
      size: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "500+"] },
      location: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

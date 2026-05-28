const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    locationType: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "onsite",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    experience: {
      type: String,
      enum: ["fresher", "1-2 years", "3-5 years", "5+ years"],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" },
      isVisible: { type: Boolean, default: true },
    },
    category: {
      type: String,
      enum: [
        "Technology",
        "Design",
        "Marketing",
        "Finance",
        "Healthcare",
        "Education",
        "Sales",
        "Operations",
        "HR",
        "Other",
      ],
      default: "Technology",
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    perks: [{ type: String }],
  },
  { timestamps: true }
);

// Index for fast searching
jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ location: 1, status: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1 });

module.exports = mongoose.model("Job", jobSchema);

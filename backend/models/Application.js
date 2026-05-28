const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "reviewing", "shortlisted", "interview", "offered", "rejected", "withdrawn"],
      default: "applied",
    },
    coverLetter: {
      type: String,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
    },
    resume: { type: String }, // URL or uploaded path
    expectedSalary: { type: Number },
    availableFrom: { type: Date },
    notes: { type: String }, // Recruiter notes (private)
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    interviewDate: { type: Date },
    interviewType: { type: String, enum: ["phone", "video", "onsite"] },
    rating: { type: Number, min: 1, max: 5 }, // Recruiter rating of applicant
    isRead: { type: Boolean, default: false }, // Has recruiter read this?
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ recruiter: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);

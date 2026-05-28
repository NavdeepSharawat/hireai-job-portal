const Application = require("../models/Application");
const Job = require("../models/Job");

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (jobseeker)
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    if (job.status !== "active") {
      return res.status(400).json({ success: false, message: "This job is no longer accepting applications." });
    }

    // Check if already applied
    const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already applied to this job." });
    }

    // Check deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ success: false, message: "Application deadline has passed." });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      recruiter: job.recruiter,
      coverLetter: req.body.coverLetter,
      resume: req.body.resume || req.user.profile?.resume,
      expectedSalary: req.body.expectedSalary,
      availableFrom: req.body.availableFrom,
      statusHistory: [{ status: "applied", note: "Application submitted" }],
    });

    // Increment applications count on job
    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicationsCount: 1 } });

    await application.populate("job", "title companyName location jobType");
    res.status(201).json({ success: true, message: "Application submitted successfully! 🎉", application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already applied to this job." });
    }
    console.error("Apply error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get my applications (job seeker)
// @route   GET /api/applications/my
// @access  Private (jobseeker)
exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { applicant: req.user._id };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate("job", "title companyName location jobType salary skills locationType")
      .populate("recruiter", "name company")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get applications for a job (recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruiter)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const { status } = req.query;
    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("applicant", "name email profile")
      .sort("-createdAt");

    // Mark as read
    await Application.updateMany({ job: req.params.jobId, isRead: false }, { isRead: true });

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
// @access  Private (recruiter)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, interviewDate, interviewType, rating } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ success: false, message: "Application not found." });
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    application.status = status;
    application.statusHistory.push({ status, note: note || "" });
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewType) application.interviewType = interviewType;
    if (rating) application.rating = rating;

    await application.save();
    await application.populate("applicant", "name email profile");

    res.json({ success: true, message: "Application status updated!", application });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Withdraw application (job seeker)
// @route   PUT /api/applications/:id/withdraw
// @access  Private (jobseeker)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found." });
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    if (["offered", "rejected"].includes(application.status)) {
      return res.status(400).json({ success: false, message: "Cannot withdraw at this stage." });
    }

    application.status = "withdrawn";
    application.statusHistory.push({ status: "withdrawn", note: "Withdrawn by applicant" });
    await application.save();

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
    res.json({ success: true, message: "Application withdrawn." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get recruiter dashboard stats
// @route   GET /api/applications/recruiter-stats
// @access  Private (recruiter)
exports.getRecruiterStats = async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalApplications, statusBreakdown] = await Promise.all([
      Job.countDocuments({ recruiter: req.user._id }),
      Job.countDocuments({ recruiter: req.user._id, status: "active" }),
      Application.countDocuments({ recruiter: req.user._id }),
      Application.aggregate([
        { $match: { recruiter: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const recentApplications = await Application.find({ recruiter: req.user._id })
      .populate("applicant", "name email profile.avatar")
      .populate("job", "title")
      .sort("-createdAt")
      .limit(5);

    res.json({
      success: true,
      stats: { totalJobs, activeJobs, totalApplications, statusBreakdown },
      recentApplications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get jobseeker dashboard stats
// @route   GET /api/applications/seeker-stats
// @access  Private (jobseeker)
exports.getSeekerStats = async (req, res) => {
  try {
    const [total, statusBreakdown] = await Promise.all([
      Application.countDocuments({ applicant: req.user._id }),
      Application.aggregate([
        { $match: { applicant: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const recent = await Application.find({ applicant: req.user._id })
      .populate("job", "title companyName location")
      .sort("-updatedAt")
      .limit(5);

    res.json({ success: true, stats: { total, statusBreakdown }, recent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

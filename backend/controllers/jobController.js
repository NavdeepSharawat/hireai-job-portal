const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      skills,
      jobType,
      locationType,
      experience,
      category,
      minSalary,
      maxSalary,
      page = 1,
      limit = 12,
      sort = "-createdAt",
    } = req.query;

    const query = { status: "active" };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Skills filter (comma-separated)
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      query.skills = { $in: skillsArray.map((s) => new RegExp(s, "i")) };
    }

    // Other filters
    if (jobType) query.jobType = jobType;
    if (locationType) query.locationType = locationType;
    if (experience) query.experience = experience;
    if (category) query.category = category;

    // Salary range filter
    if (minSalary || maxSalary) {
      query["salary.isVisible"] = true;
      if (minSalary) query["salary.min"] = { $gte: Number(minSalary) };
      if (maxSalary) query["salary.max"] = { $lte: Number(maxSalary) };
    }

    const skip = (page - 1) * limit;
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("recruiter", "name company")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "name email company");
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (recruiter)
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user._id,
      companyName: req.body.companyName || req.user.company?.name,
      companyLogo: req.body.companyLogo || req.user.company?.logo,
    };

    const job = await Job.create(jobData);
    res.status(201).json({ success: true, message: "Job posted successfully!", job });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (recruiter - owner)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this job." });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: "Job updated!", job });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter - owner)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: "Job deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (recruiter)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort("-createdAt");
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationsCount: applications };
      })
    );
    res.json({ success: true, jobs: jobsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get trending skills (for suggestions)
// @route   GET /api/jobs/skills
// @access  Public
exports.getTrendingSkills = async (req, res) => {
  try {
    const skills = await Job.aggregate([
      { $match: { status: "active" } },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);
    res.json({ success: true, skills: skills.map((s) => ({ skill: s._id, count: s.count })) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

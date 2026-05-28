const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getRecruiterStats,
  getSeekerStats,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/:jobId", protect, authorize("jobseeker"), applyToJob);
router.get("/my", protect, authorize("jobseeker"), getMyApplications);
router.get("/recruiter-stats", protect, authorize("recruiter"), getRecruiterStats);
router.get("/seeker-stats", protect, authorize("jobseeker"), getSeekerStats);
router.get("/job/:jobId", protect, authorize("recruiter"), getJobApplications);
router.put("/:id/status", protect, authorize("recruiter"), updateApplicationStatus);
router.put("/:id/withdraw", protect, authorize("jobseeker"), withdrawApplication);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getCompanyData,
  getJobs,
  getJobById,
  createJob,
  updateJob,
} = require("../controllers/jobController");
const auth = require("../middleware/auth");

// Protected: requires valid JWT
router.get("/github/:orgName", auth, getCompanyData);
router.get("/jobs", auth, getJobs);
router.get("/jobs/:id", auth, getJobById);
router.post("/jobs", auth, createJob);
router.put("/jobs/:id", auth, updateJob);

module.exports = router;

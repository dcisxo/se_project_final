const express = require("express");
const router = express.Router();
const {
  getPublicJobs,
  getPublicJobById,
  applyToJob,
} = require("../controllers/publicController");

router.get("/jobs", getPublicJobs);
router.get("/jobs/:jobId", getPublicJobById);
router.post("/jobs/:jobId/apply", applyToJob);

module.exports = router;

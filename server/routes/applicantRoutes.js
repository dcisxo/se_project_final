const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getApplicants,
  createApplicant,
  updateApplicantStatus,
} = require("../controllers/applicantController");
const auth = require("../middleware/auth");

router.get("/", auth, getApplicants);
router.post("/", auth, createApplicant);
router.patch("/:applicantId/status", auth, updateApplicantStatus);

module.exports = router;

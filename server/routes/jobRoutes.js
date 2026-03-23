const express = require("express");
const router = express.Router();
const { getCompanyData } = require("../controllers/jobController");
const auth = require("../middleware/auth");

// Protected: requires valid JWT
router.get("/github/:orgName", auth, getCompanyData);

module.exports = router;

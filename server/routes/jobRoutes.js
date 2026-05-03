import { Router } from "express";
const router = Router();
import {
  getCompanyData,
  getJobs,
  getJobById,
  createJob,
  updateJob,
} from "../controllers/jobController.js";
import auth from "../middleware/auth.js";

// Protected: requires valid JWT
router.get("/github/:orgName", auth, getCompanyData);
router.get("/jobs", auth, getJobs);
router.get("/jobs/:id", auth, getJobById);
router.post("/jobs", auth, createJob);
router.put("/jobs/:id", auth, updateJob);

export default router;

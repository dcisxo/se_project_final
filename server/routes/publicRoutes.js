import { Router } from "express";
const router = Router();
import {
  getPublicCompanyData,
  getPublicJobs,
  getPublicJobById,
  applyToJob,
} from "../controllers/publicController.js";

router.get("/github/:orgName", getPublicCompanyData);
router.get("/jobs", getPublicJobs);
router.get("/jobs/:jobId", getPublicJobById);
router.post("/jobs/:jobId/apply", applyToJob);

export default router;

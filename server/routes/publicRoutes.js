import { Router } from "express";
const router = Router();
import {
  getPublicJobs,
  getPublicJobById,
  applyToJob,
} from "../controllers/publicController";

router.get("/jobs", getPublicJobs);
router.get("/jobs/:jobId", getPublicJobById);
router.post("/jobs/:jobId/apply", applyToJob);

export default router;

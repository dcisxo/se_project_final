import { Router } from "express";
const router = Router({ mergeParams: true });
import {
  getApplicants,
  createApplicant,
  updateApplicantStatus,
} from "../controllers/applicantController.js";
import auth from "../middleware/auth.js";

router.get("/", auth, getApplicants);
router.post("/", auth, createApplicant);
router.patch("/:applicantId/status", auth, updateApplicantStatus);

export default router;

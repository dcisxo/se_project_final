import { Router } from "express";
const router = Router();
import { register, login, getCurrentUser } from "../controllers/authController";
import auth from "../middleware/auth";

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);

export default router;

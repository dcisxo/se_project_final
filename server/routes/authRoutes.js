import { Router } from "express";
const router = Router();
import { register, login, getCurrentUser } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);

export default router;

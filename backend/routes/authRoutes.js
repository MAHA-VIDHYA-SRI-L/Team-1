import express from "express";
import { registerStudent, registerStaff, loginUser, resetPassword, getMe, refreshSession } from "../controllers/authController.js";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.post("/refresh", refreshSession);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/register/student", verifyAdmin, registerStudent);
router.post("/register/staff", verifyAdmin, registerStaff);

export default router;

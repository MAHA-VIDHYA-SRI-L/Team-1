import express from "express";
import { registerStudent, registerStaff, loginUser, resetPassword } from "../controllers/authController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/register/student", verifyAdmin, registerStudent);
router.post("/register/staff", verifyAdmin, registerStaff);

export default router;

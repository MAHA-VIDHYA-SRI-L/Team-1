import express from "express";
import { registerStudent, registerStaff, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/staff", registerStaff);
router.post("/login", loginUser);

export default router;

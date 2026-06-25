import express from "express";
import { getAllStudents, getStudentById } from "../controllers/staffController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/students", verifyToken, getAllStudents);
router.get("/students/:id", verifyToken, getStudentById);

export default router;

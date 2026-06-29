import express from "express";
import {
  getAllStudents,
  getStudentById,
  updatePlacementStatus,
  verifyStudent,
  updateCertificationStatus,
} from "../controllers/staffController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/students", verifyToken, getAllStudents);
router.get("/students/:id", verifyToken, getStudentById);
router.patch("/students/:id/placement", verifyToken, updatePlacementStatus);
router.patch("/students/:id/verify", verifyToken, verifyStudent);
router.patch("/certifications/:certId/status", verifyToken, updateCertificationStatus);

export default router;

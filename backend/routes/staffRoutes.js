import express from "express";
import {
  getAllStudents,
  getStudentById,
  updatePlacementStatus,
  verifyStudent as verifyStudentRecord,
  updateCertificationStatus,
  blockStudentByStaff,
} from "../controllers/staffController.js";
import { verifyToken, verifyStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, verifyStaff);

router.get("/students", getAllStudents);
router.get("/students/:id", getStudentById);
router.patch("/students/:id/placement", updatePlacementStatus);
router.patch("/students/:id/verify", verifyStudentRecord);
router.patch("/students/:id/block", blockStudentByStaff);
router.patch("/certifications/:certId/status", updateCertificationStatus);

export default router;

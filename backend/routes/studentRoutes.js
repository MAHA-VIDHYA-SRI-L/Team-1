import express from "express";
import { getStudentProfile, updateStudentProfile, updateSelfPlacementStatus } from "../controllers/studentController.js";
import { analyzeStudent, getAnalysis } from "../controllers/analysisController.js";
import { verifyToken, verifyStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, verifyStudent);

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.patch("/placement", updateSelfPlacementStatus);
router.get("/analyze", getAnalysis);
router.post("/analyze", analyzeStudent);

export default router;

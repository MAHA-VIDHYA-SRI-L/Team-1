import express from "express";
import { analyzeStudent, getAnalysis } from "../controllers/analysisController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAnalysis);
router.post("/", verifyToken, analyzeStudent);

export default router;

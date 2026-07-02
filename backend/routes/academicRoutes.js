import express from "express";
import { getAcademicDetails, upsertAcademicDetails } from "../controllers/academicController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAcademicDetails);
router.post("/", verifyToken, upsertAcademicDetails);
router.put("/", verifyToken, upsertAcademicDetails);

export default router;

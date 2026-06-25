import express from "express";
import { getAcademicDetails, createAcademicDetails, updateAcademicDetails } from "../controllers/academicController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAcademicDetails);
router.post("/", verifyToken, createAcademicDetails);
router.put("/", verifyToken, updateAcademicDetails);

export default router;

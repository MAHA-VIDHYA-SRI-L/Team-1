import express from "express";
import { getStudentProfile, updateStudentProfile, updateSelfPlacementStatus } from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getStudentProfile);
router.put("/profile", verifyToken, updateStudentProfile);
router.patch("/placement", verifyToken, updateSelfPlacementStatus);

export default router;

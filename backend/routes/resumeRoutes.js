import express from "express";
import multer from "multer";
import { uploadResume, getResume } from "../controllers/resumeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get("/", verifyToken, getResume);
router.post("/", verifyToken, upload.single("resume"), uploadResume);

export default router;

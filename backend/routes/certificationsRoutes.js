import express from "express";
import { getCertifications, addCertification, deleteCertification } from "../controllers/certificationsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCertifications);
router.post("/", verifyToken, addCertification);
router.delete("/:id", verifyToken, deleteCertification);

export default router;

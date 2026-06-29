import express from "express";
import { getCertifications, addCertification, updateCertification, deleteCertification } from "../controllers/certificationsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCertifications);
router.post("/", verifyToken, addCertification);
router.put("/:id", verifyToken, updateCertification);
router.delete("/:id", verifyToken, deleteCertification);

export default router;

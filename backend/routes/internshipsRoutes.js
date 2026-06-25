import express from "express";
import { getInternships, addInternship, deleteInternship } from "../controllers/internshipsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getInternships);
router.post("/", verifyToken, addInternship);
router.delete("/:id", verifyToken, deleteInternship);

export default router;

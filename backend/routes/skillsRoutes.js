import express from "express";
import { getSkills, addSkill, deleteSkill } from "../controllers/skillsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getSkills);
router.post("/", verifyToken, addSkill);
router.delete("/:id", verifyToken, deleteSkill);

export default router;

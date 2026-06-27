import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getAllStudents, getStudentById, updateStudent, toggleBlockStudent, deleteStudent,
} from "../controllers/adminController.js";
import {
  getAllStaff, getStaffById, updateStaff, toggleBlockStaff, deleteStaff,
} from "../controllers/adminController.js";

const router = express.Router();
router.use(verifyAdmin);

// Students
router.get("/students", getAllStudents);
router.get("/students/:id", getStudentById);
router.put("/students/:id", updateStudent);
router.patch("/students/:id/block", toggleBlockStudent);
router.delete("/students/:id", deleteStudent);

// Staff
router.get("/staff", getAllStaff);
router.get("/staff/:id", getStaffById);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/block", toggleBlockStaff);
router.delete("/staff/:id", deleteStaff);

export default router;

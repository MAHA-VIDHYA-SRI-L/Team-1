import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import certificationsRoutes from "./routes/certificationsRoutes.js";
import internshipsRoutes from "./routes/internshipsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Set up an array of allowed local development origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin === process.env.CLIENT_URL)
      return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`), false);
  },
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student/academic", academicRoutes);
app.use("/api/student/skills", skillsRoutes);
app.use("/api/student/certifications", certificationsRoutes);
app.use("/api/student/internships", internshipsRoutes);
app.use("/api/student/resume", resumeRoutes);
app.use("/api/student/analyze", analysisRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
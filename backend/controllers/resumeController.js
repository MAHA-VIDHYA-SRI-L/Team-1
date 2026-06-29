import supabase from "../config/supabase.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const getStudentId = async (authUserId) => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();
  if (error || !data) return null;
  return data.id;
};

export const uploadResume = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    if (!req.file) return res.status(400).json({ error: "PDF file is required" });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ error: "Only PDF files are allowed" });

    const fileName = `${studentId}/resume_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, req.file.buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
    const resumeUrl = urlData.publicUrl;

    // Extract text for AI analysis
    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text;

    // Upsert so only latest resume is kept per student
    const { error: dbError } = await supabase
      .from("resumes")
      .upsert({ student_id: studentId, resume_url: resumeUrl, resume_text: resumeText, uploaded_at: new Date().toISOString() }, { onConflict: "student_id" });

    if (dbError) return res.status(400).json({ error: dbError.message });

    return res.status(201).json({ message: "Resume uploaded successfully", resume_url: resumeUrl, resume_text: resumeText });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("resumes")
      .select("resume_url, uploaded_at")
      .eq("student_id", studentId)
      .single();

    if (error || !data) return res.status(404).json({ error: "No resume found" });

    return res.status(200).json({ resume: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

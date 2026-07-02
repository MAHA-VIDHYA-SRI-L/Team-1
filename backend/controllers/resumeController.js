import supabase from "../config/supabase.js";
import { analyzeStudent } from "./analysisController.js";
import pdfParse from "pdf-parse";

const getStudentId = async (authUserId) => {
  const { data } = await supabase.from("student_profiles").select("id").eq("auth_user_id", authUserId).single();
  return data?.id || null;
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

    const { data: signedData, error: signedError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(fileName, 60 * 60);
    if (signedError) return res.status(400).json({ error: signedError.message });
    const resumeUrl = signedData.signedUrl;

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text;

    // Store the file path (not signed URL) so we can re-sign on each fetch
    const { error: dbError } = await supabase
      .from("resumes")
      .upsert({ student_id: studentId, resume_url: fileName, resume_text: resumeText, uploaded_at: new Date().toISOString() }, { onConflict: "student_id" });
    if (dbError) return res.status(400).json({ error: dbError.message });

    // Auto-trigger analysis after resume upload (fire-and-forget)
    analyzeStudent(req, { status: () => ({ json: () => {} }) }).catch(() => {});

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

    // Re-sign the stored file path on every fetch (1 hour expiry)
    const { data: signed, error: signErr } = await supabase.storage
      .from("resumes")
      .createSignedUrl(data.resume_url, 60 * 60);
    if (signErr) return res.status(400).json({ error: signErr.message });

    return res.status(200).json({ resume: { resume_url: signed.signedUrl, uploaded_at: data.uploaded_at } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

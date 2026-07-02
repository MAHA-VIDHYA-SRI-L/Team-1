import { supabaseAdmin } from "../config/supabase.js";
import multer from "multer";

export const uploadCertificateFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const uploadCertFile = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${studentId}/cert_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("certificates")
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from("certificates")
      .createSignedUrl(fileName, 60 * 60); // 1 hour expiry
    if (signedError) return res.status(400).json({ error: signedError.message });
    return res.status(200).json({ url: signedData.signedUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStudentId = async (authUserId) => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();
  if (error || !data) return null;
  return data.id;
};

export const getCertifications = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("certifications")
      .select("id, certification_name, issuer, category, start_date, end_date, description, certificate_url, status")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ certifications: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { certification_name, issuer, certificate_url, category, start_date, end_date, description } = req.body;
    if (!certification_name) return res.status(400).json({ error: "certification_name is required" });

    const { data, error } = await supabase
      .from("certifications")
      .insert({
        student_id: studentId,
        certification_name, issuer, certificate_url,
        category: category || "General",
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Certification added successfully", id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { id } = req.params;
    const { certification_name, issuer, certificate_url, category, start_date, end_date, description } = req.body;

    const { error } = await supabase
      .from("certifications")
      .update({
        certification_name, issuer, certificate_url,
        category, start_date, end_date, description,
        status: "pending", // reset to pending on edit
      })
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Certification updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { id } = req.params;

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Certification deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

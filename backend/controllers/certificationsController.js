import supabase from "../config/supabase.js";

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
      .select("id, certification_name, issuer, certificate_url")
      .eq("student_id", studentId);

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

    const { certification_name, issuer, certificate_url } = req.body;
    if (!certification_name) return res.status(400).json({ error: "certification_name is required" });

    const { error } = await supabase
      .from("certifications")
      .insert({ student_id: studentId, certification_name, issuer, certificate_url });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Certification added successfully" });
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

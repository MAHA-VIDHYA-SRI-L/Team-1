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

export const getInternships = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("internships")
      .select("id, company_name, role, duration, certificate_url")
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ internships: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const addInternship = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { company_name, role, duration, certificate_url } = req.body;
    if (!company_name || !role) return res.status(400).json({ error: "company_name and role are required" });

    const { error } = await supabase
      .from("internships")
      .insert({ student_id: studentId, company_name, role, duration, certificate_url });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Internship added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { id } = req.params;

    const { error } = await supabase
      .from("internships")
      .delete()
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Internship deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

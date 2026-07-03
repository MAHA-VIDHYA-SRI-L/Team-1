import supabase from "../config/supabase.js";
import { getCachedStudentId } from "../utils/cacheUtils.js";

const getStudentId = async (req) => {
  return req.profileId || await getCachedStudentId(req.user?.id);
};

export const getInternships = async (req, res) => {
  try {
    const studentId = await getStudentId(req);
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
    const studentId = await getStudentId(req);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { company_name, role, duration, certificate_url } = req.body;
    if (!company_name || !company_name.trim()) return res.status(400).json({ error: "company_name is required" });
    if (!role || !role.trim()) return res.status(400).json({ error: "role is required" });
    if (company_name.trim().length > 150) return res.status(400).json({ error: "company_name must be 150 characters or fewer" });
    if (role.trim().length > 100) return res.status(400).json({ error: "role must be 100 characters or fewer" });
    if (duration && duration.trim().length > 50) return res.status(400).json({ error: "duration must be 50 characters or fewer" });
    if (certificate_url && !/^https?:\/\/.+/.test(certificate_url))
      return res.status(400).json({ error: "certificate_url must be a valid URL" });

    const { error } = await supabase
      .from("internships")
      .insert({ student_id: studentId, company_name: company_name.trim(), role: role.trim(), duration: duration?.trim() || null, certificate_url: certificate_url || null });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Internship added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    const studentId = await getStudentId(req);
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

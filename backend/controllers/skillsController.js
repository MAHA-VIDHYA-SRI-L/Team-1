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

export const getSkills = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("skills")
      .select("id, skill_name, proficiency")
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ skills: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { skill_name, proficiency } = req.body;
    if (!skill_name) return res.status(400).json({ error: "skill_name is required" });

    const { error } = await supabase
      .from("skills")
      .insert({ student_id: studentId, skill_name, proficiency });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Skill added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { id } = req.params;

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Skill deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

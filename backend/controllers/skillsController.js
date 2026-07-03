import supabase from "../config/supabase.js";
import { getCachedStudentId } from "../utils/cacheUtils.js";

const getStudentId = async (req) => {
  return req.profileId || await getCachedStudentId(req.user?.id);
};

export const getSkills = async (req, res) => {
  try {
    const studentId = await getStudentId(req);
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
    const studentId = await getStudentId(req);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { skill_name, proficiency } = req.body;
    if (!skill_name || !skill_name.trim()) return res.status(400).json({ error: "skill_name is required" });
    if (skill_name.trim().length > 100) return res.status(400).json({ error: "skill_name must be 100 characters or fewer" });

    const VALID_PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (proficiency && !VALID_PROFICIENCIES.includes(proficiency))
      return res.status(400).json({ error: `proficiency must be one of: ${VALID_PROFICIENCIES.join(', ')}` });

    const { error } = await supabase
      .from("skills")
      .insert({ student_id: studentId, skill_name: skill_name.trim(), proficiency: proficiency || null });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Skill added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const studentId = await getStudentId(req);
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

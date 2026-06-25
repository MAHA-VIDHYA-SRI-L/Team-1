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

export const getAcademicDetails = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabase
      .from("academic_details")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Academic details not found" });

    return res.status(200).json({ academic: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createAcademicDetails = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const {
      tenth_school, tenth_percentage,
      twelfth_school, twelfth_percentage,
      ug_college, ug_cgpa,
      pg_college, pg_cgpa,
      placement_status,
    } = req.body;

    if (!placement_status) return res.status(400).json({ error: "placement_status is required" });

    const { error } = await supabase
      .from("academic_details")
      .insert({
        student_id: studentId,
        tenth_school, tenth_percentage,
        twelfth_school, twelfth_percentage,
        ug_college, ug_cgpa,
        pg_college, pg_cgpa,
        placement_status,
      });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Academic details added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAcademicDetails = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const allowed = [
      "tenth_school", "tenth_percentage",
      "twelfth_school", "twelfth_percentage",
      "ug_college", "ug_cgpa",
      "pg_college", "pg_cgpa",
      "placement_status",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });

    const { error } = await supabase
      .from("academic_details")
      .update(updates)
      .eq("student_id", studentId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Academic details updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

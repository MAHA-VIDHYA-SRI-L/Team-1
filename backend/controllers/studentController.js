import supabase from "../config/supabase.js";

export const getStudentProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("full_name, email, register_no, phone, address, dob, degree, branch, current_year")
      .eq("auth_user_id", req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Profile not found" });

    return res.status(200).json({ profile: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { phone, address, dob, degree, branch, current_year } = req.body;

    const updates = {};
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (dob !== undefined) updates.dob = dob;
    if (degree !== undefined) updates.degree = degree;
    if (branch !== undefined) updates.branch = branch;
    if (current_year !== undefined) updates.current_year = current_year;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("student_profiles")
      .update(updates)
      .eq("auth_user_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

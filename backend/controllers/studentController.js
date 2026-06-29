import supabase from "../config/supabase.js";

export const getStudentProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select(
        "full_name, email, register_no, phone, alternative_phone, address, district, state_name, pin_code, dob, degree, branch, current_year, year_of_study, pass_out_year, current_semester, semester_term, linkedin_url, is_verified"
      )
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
    const {
      phone, alternative_phone,
      address, district, state_name, pin_code,
      dob, degree, branch, current_year,
      year_of_study, pass_out_year, current_semester, semester_term,
      linkedin_url,
    } = req.body;

    const updates = {};
    if (phone !== undefined) updates.phone = phone;
    if (alternative_phone !== undefined) updates.alternative_phone = alternative_phone;
    if (address !== undefined) updates.address = address;
    if (district !== undefined) updates.district = district;
    if (state_name !== undefined) updates.state_name = state_name;
    if (pin_code !== undefined) updates.pin_code = pin_code;
    if (dob !== undefined) updates.dob = dob;
    if (degree !== undefined) updates.degree = degree;
    if (branch !== undefined) updates.branch = branch;
    if (current_year !== undefined) updates.current_year = current_year;
    if (year_of_study !== undefined) updates.year_of_study = year_of_study;
    if (pass_out_year !== undefined) updates.pass_out_year = pass_out_year;
    if (current_semester !== undefined) updates.current_semester = current_semester;
    if (semester_term !== undefined) updates.semester_term = semester_term;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
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

import supabase, { supabaseAdmin } from "../config/supabase.js";

export const getStudentProfile = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("student_profiles")
      .select("full_name, email, register_no, phone, alternative_phone, address, district, state_name, pin_code, dob, degree, branch, current_year, year_of_study, pass_out_year, current_semester, semester_term, linkedin_url, is_verified")
      .eq("auth_user_id", req.user.id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Profile not found" });
    return res.status(200).json({ profile: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateSelfPlacementStatus = async (req, res) => {
  try {
    const { placement_status, company_name } = req.body;

    if (!["Placed", "Not Placed"].includes(placement_status))
      return res.status(400).json({ error: "placement_status must be 'Placed' or 'Not Placed'" });

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("auth_user_id", req.user.id)
      .single();

    if (profileErr || !profile) return res.status(404).json({ error: "Profile not found" });

    const updates = { placement_status, placement_verified: false };
    if (company_name !== undefined) updates.company_name = company_name;

    const { error } = await supabaseAdmin
      .from("academic_details")
      .update(updates)
      .eq("student_id", profile.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Placement status updated" });
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

    const { error } = await supabaseAdmin.rpc('update_student_profile', {
      p_auth_user_id: req.user.id,
      p_phone: phone ?? null,
      p_alternative_phone: alternative_phone ?? null,
      p_address: address ?? null,
      p_district: district ?? null,
      p_state_name: state_name ?? null,
      p_pin_code: pin_code ?? null,
      p_dob: dob ?? null,
      p_degree: degree ?? null,
      p_branch: branch ?? null,
      p_current_year: current_year ?? null,
      p_year_of_study: year_of_study ?? null,
      p_pass_out_year: pass_out_year ?? null,
      p_current_semester: current_semester ?? null,
      p_semester_term: semester_term ?? null,
      p_linkedin_url: linkedin_url ?? null,
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

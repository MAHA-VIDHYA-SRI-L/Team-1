import supabase from "../config/supabase.js";

export const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, degree, branch, current_year");

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ students: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, address, dob, degree, branch, current_year")
      .eq("id", id)
      .single();

    if (profileError || !profile) return res.status(404).json({ error: "Student not found" });

    const [
      { data: academic },
      { data: skills },
      { data: certifications },
      { data: internships },
      { data: resume },
      { data: analysis },
    ] = await Promise.all([
      supabase.from("academic_details").select("*").eq("student_id", id).single(),
      supabase.from("skills").select("skill_name, proficiency").eq("student_id", id),
      supabase.from("certifications").select("certification_name, issuer, certificate_url").eq("student_id", id),
      supabase.from("internships").select("company_name, role, duration, certificate_url").eq("student_id", id),
      supabase.from("resumes").select("resume_url, uploaded_at").eq("student_id", id).single(),
      supabase.from("placement_analysis").select("readiness_score, readiness_status, strengths, weaknesses, recommendations, consolidated_report, analyzed_at").eq("student_id", id).single(),
    ]);

    return res.status(200).json({
      profile,
      academic: academic || null,
      skills: skills || [],
      certifications: certifications || [],
      internships: internships || [],
      resume: resume || null,
      analysis: analysis || null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

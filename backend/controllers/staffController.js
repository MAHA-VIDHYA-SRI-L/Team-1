import supabase from "../config/supabase.js";

export const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, degree, branch, current_year, is_verified, is_blocked");

    if (error) return res.status(400).json({ error: error.message });

    // If no students exist yet, return empty array immediately
    if (!data || data.length === 0) return res.status(200).json({ students: [] });

    // Attach readiness scores and placement status from academic_details
    const studentIds = data.map(s => s.id);
    const { data: academics } = await supabase
      .from("academic_details")
      .select("student_id, placement_status, company_name, ug_cgpa, pg_cgpa")
      .in("student_id", studentIds);

    const { data: analyses } = await supabase
      .from("placement_analysis")
      .select("student_id, readiness_score")
      .in("student_id", studentIds);

    const academicMap = {};
    (academics || []).forEach(a => { academicMap[a.student_id] = a; });

    const analysisMap = {};
    (analyses || []).forEach(a => { analysisMap[a.student_id] = a; });

    const enriched = data.map(s => ({
      ...s,
      placement_status: academicMap[s.id]?.placement_status || "Not Placed",
      company_name: academicMap[s.id]?.company_name ?? null,
      readiness_score: analysisMap[s.id]?.readiness_score || 0,
    }));

    return res.status(200).json({ students: enriched });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, address, dob, degree, branch, current_year, is_verified")
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
      supabase.from("certifications").select("id, certification_name, issuer, category, start_date, end_date, description, certificate_url").eq("student_id", id),
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

export const updatePlacementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { placement_status, company_name } = req.body;

    if (!["Placed", "Not Placed"].includes(placement_status)) {
      return res.status(400).json({ error: "placement_status must be 'Placed' or 'Not Placed'" });
    }

    const updates = { placement_status };
    if (company_name !== undefined) updates.company_name = company_name;

    const { error } = await supabase
      .from("academic_details")
      .update(updates)
      .eq("student_id", id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Placement status updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const verifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const { error } = await supabase
      .from("student_profiles")
      .update({ is_verified: !!is_verified })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: is_verified ? "Student verified" : "Verification removed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCertificationStatus = async (req, res) => {
  try {
    const { certId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Pending Review"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { error } = await supabase
      .from("certifications")
      .update({ status })
      .eq("id", certId);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Certification status updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

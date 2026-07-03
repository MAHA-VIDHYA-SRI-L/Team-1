import { supabaseAdmin } from "../config/supabase.js";

export const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, degree, branch, current_year, is_verified, is_blocked");

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(200).json({ students: [] });

    const studentIds = data.map(s => s.id);

    const { data: academics } = await supabaseAdmin
      .from("academic_details")
      .select("student_id, placement_status, placement_verified, company_name, ug_cgpa, pg_cgpa")
      .in("student_id", studentIds);

    const { data: analyses } = await supabaseAdmin
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
      placement_verified: academicMap[s.id]?.placement_verified || false,
      company_name: academicMap[s.id]?.company_name ?? null,
      readiness_score: analysisMap[s.id]?.readiness_score ?? 0,
      is_verified: s.is_verified ?? false,
    }));

    return res.status(200).json({ students: enriched });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("student_profiles")
      .select("id, full_name, email, register_no, phone, alternative_phone, address, district, state_name, pin_code, dob, degree, branch, current_year, year_of_study, pass_out_year, current_semester, semester_term, linkedin_url, is_verified, is_blocked")
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
      supabaseAdmin.from("academic_details").select("*").eq("student_id", id).single(),
      supabaseAdmin.from("skills").select("skill_name, proficiency").eq("student_id", id),
      supabaseAdmin.from("certifications").select("id, certification_name, issuer, category, start_date, end_date, description, certificate_url, status").eq("student_id", id),
      supabaseAdmin.from("internships").select("company_name, role, duration, certificate_url").eq("student_id", id),
      supabaseAdmin.from("resumes").select("resume_url, uploaded_at").eq("student_id", id).single(),
      supabaseAdmin.from("placement_analysis").select("readiness_score, readiness_status, strengths, weaknesses, recommendations, consolidated_report, analyzed_at").eq("student_id", id).single(),
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

    if (!["Placed", "Not Placed"].includes(placement_status))
      return res.status(400).json({ error: "placement_status must be 'Placed' or 'Not Placed'" });

    const updates = { placement_status, placement_verified: placement_status === 'Placed' };
    if (company_name !== undefined) updates.company_name = placement_status === 'Placed' ? company_name : null;

    // Check academic_details row exists first
    const { data: existing } = await supabaseAdmin
      .from("academic_details")
      .select("student_id")
      .eq("student_id", id)
      .limit(1)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: "Student has no academic record. Ask student to complete their profile first." });

    const { error } = await supabaseAdmin
      .from("academic_details")
      .update(updates)
      .eq("student_id", id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Placement status updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const blockStudentByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;

    const { error } = await supabaseAdmin
      .from("student_profiles")
      .update({ is_blocked: !!is_blocked })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: is_blocked ? "Student blocked" : "Student unblocked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const verifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const { error } = await supabaseAdmin
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

    const normalized = status?.toLowerCase();
    if (!["approved", "rejected", "pending"].includes(normalized))
      return res.status(400).json({ error: "Invalid status" });

    const { error } = await supabaseAdmin
      .from("certifications")
      .update({ status: normalized })
      .eq("id", certId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Certification status updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

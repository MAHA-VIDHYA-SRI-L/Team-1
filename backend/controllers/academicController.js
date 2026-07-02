import { supabaseAdmin } from "../config/supabase.js";

const getStudentId = async (authUserId) => {
  const { data } = await supabaseAdmin.from("student_profiles").select("id").eq("auth_user_id", authUserId).single();
  return data?.id || null;
};

const toFloat = (val, min = 0, max = Infinity) => {
  if (val === undefined || val === null || val === '') return null;
  const n = parseFloat(val);
  if (isNaN(n) || n < min || n > max) return undefined; // signals invalid
  return n;
};

export const getAcademicDetails = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const { data, error } = await supabaseAdmin
      .from("academic_details")
      .select("*")
      .eq("student_id", studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return res.status(404).json({ error: "Academic details not found" });

    // Auto-correct stale rows
    if (data.placement_verified && data.placement_status !== 'Placed') {
      await supabaseAdmin.from("academic_details")
        .update({ placement_verified: false, company_name: null })
        .eq("student_id", studentId);
      data.placement_verified = false;
      data.company_name = null;
    }

    return res.status(200).json({ academic: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const upsertAcademicDetails = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) return res.status(404).json({ error: "Student profile not found" });

    const {
      board_of_study, graduation_standing,
      tenth_school, twelfth_school,
      diploma_institution, ug_college, pg_college,
      sgpa_values, placement_status,
    } = req.body;

    const tenth_percentage  = toFloat(req.body.tenth_percentage,  0, 100);
    const twelfth_percentage = toFloat(req.body.twelfth_percentage, 0, 100);
    const diploma_percentage = toFloat(req.body.diploma_percentage, 0, 100);
    const ug_cgpa = toFloat(req.body.ug_cgpa, 0, 10);
    const pg_cgpa = toFloat(req.body.pg_cgpa, 0, 10);

    if (tenth_percentage  === undefined) return res.status(400).json({ error: "tenth_percentage must be 0-100" });
    if (twelfth_percentage === undefined) return res.status(400).json({ error: "twelfth_percentage must be 0-100" });
    if (diploma_percentage === undefined) return res.status(400).json({ error: "diploma_percentage must be 0-100" });
    if (ug_cgpa === undefined) return res.status(400).json({ error: "ug_cgpa must be 0-10" });
    if (pg_cgpa === undefined) return res.status(400).json({ error: "pg_cgpa must be 0-10" });

    // Store sgpa_values as strings (column is text[]) — keep empty slots as empty string
    const sgpa_normalised = Array.isArray(sgpa_values)
      ? sgpa_values.slice(0, 8).map(v => (v === null || v === undefined) ? '' : String(v))
      : Array(8).fill('');

    const VALID_STATUSES = ['Placed', 'Not Placed'];
    const resolvedStatus = VALID_STATUSES.includes(placement_status) ? placement_status : 'Not Placed';

    const payload = {
      board_of_study, graduation_standing,
      tenth_school, tenth_percentage,
      twelfth_school, twelfth_percentage,
      diploma_percentage, diploma_institution,
      ug_college, ug_cgpa,
      pg_college, pg_cgpa,
      sgpa_values: sgpa_normalised,
      placement_status: resolvedStatus,
    };

    // Check if row exists (use maybeSingle to handle duplicates gracefully)
    const { data: existing } = await supabaseAdmin
      .from('academic_details')
      .select('student_id')
      .eq('student_id', studentId)
      .limit(1)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabaseAdmin
        .from('academic_details')
        .update(payload)
        .eq('student_id', studentId));
    } else {
      ({ error } = await supabaseAdmin
        .from('academic_details')
        .insert({ student_id: studentId, ...payload }));
    }

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Academic details saved' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

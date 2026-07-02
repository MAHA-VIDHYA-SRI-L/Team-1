import { supabaseAdmin } from "../config/supabase.js";

export const getAllStudents = async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("id, full_name, register_no, email, phone, is_blocked, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

export const getStudentById = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Student not found" });
  return res.json(data);
};

export const updateStudent = async (req, res) => {
  const { full_name, register_no, phone, email } = req.body;
  const id = req.params.id;

  if (!full_name && !register_no && !phone && !email)
    return res.status(400).json({ error: "At least one field is required to update" });
  if (full_name && full_name.trim().length < 2)
    return res.status(400).json({ error: "full_name must be at least 2 characters" });
  if (phone && !/^[6-9]\d{9}$/.test(phone))
    return res.status(400).json({ error: "phone must be a valid 10-digit Indian number" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email format" });

  if (email) {
    const { data: dup } = await supabaseAdmin.from("student_profiles").select("id").eq("email", email).neq("id", id).single();
    if (dup) return res.status(400).json({ error: "This email is already used by another student" });
  }
  if (phone) {
    const { data: dup } = await supabaseAdmin.from("student_profiles").select("id").eq("phone", phone).neq("id", id).single();
    if (dup) return res.status(400).json({ error: "This phone number is already used by another student" });
  }

  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .update({ full_name, register_no, phone, email })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

export const toggleBlockStudent = async (req, res) => {
  const { is_blocked } = req.body;
  if (typeof is_blocked !== 'boolean')
    return res.status(400).json({ error: "is_blocked must be a boolean" });
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .update({ is_blocked })
    .eq("id", req.params.id)
    .select("id, is_blocked")
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

export const deleteStudent = async (req, res) => {
  const { data: profile, error: fetchErr } = await supabaseAdmin
    .from("student_profiles")
    .select("auth_user_id")
    .eq("id", req.params.id)
    .single();

  if (fetchErr) return res.status(404).json({ error: "Student not found" });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(profile.auth_user_id);
  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: "Student deleted successfully" });
};

export const getAllStaff = async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("staff_profiles")
    .select("id, full_name, faculty_id, email, phone, is_blocked, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};

export const getStaffById = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("staff_profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Staff not found" });
  return res.json(data);
};

export const updateStaff = async (req, res) => {
  const { full_name, faculty_id, phone, email } = req.body;
  const id = req.params.id;

  if (!full_name && !faculty_id && !phone && !email)
    return res.status(400).json({ error: "At least one field is required to update" });
  if (full_name && full_name.trim().length < 2)
    return res.status(400).json({ error: "full_name must be at least 2 characters" });
  if (phone && !/^[6-9]\d{9}$/.test(phone))
    return res.status(400).json({ error: "phone must be a valid 10-digit Indian number" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email format" });

  if (email) {
    const { data: dup } = await supabaseAdmin.from("staff_profiles").select("id").eq("email", email).neq("id", id).single();
    if (dup) return res.status(400).json({ error: "This email is already used by another staff member" });
  }
  if (phone) {
    const { data: dup } = await supabaseAdmin.from("staff_profiles").select("id").eq("phone", phone).neq("id", id).single();
    if (dup) return res.status(400).json({ error: "This phone number is already used by another staff member" });
  }

  const { data, error } = await supabaseAdmin
    .from("staff_profiles")
    .update({ full_name, faculty_id, phone, email })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

export const toggleBlockStaff = async (req, res) => {
  const { is_blocked } = req.body;
  if (typeof is_blocked !== 'boolean')
    return res.status(400).json({ error: "is_blocked must be a boolean" });
  const { data, error } = await supabaseAdmin
    .from("staff_profiles")
    .update({ is_blocked })
    .eq("id", req.params.id)
    .select("id, is_blocked")
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

export const deleteStaff = async (req, res) => {
  const { data: profile, error: fetchErr } = await supabaseAdmin
    .from("staff_profiles")
    .select("auth_user_id")
    .eq("id", req.params.id)
    .single();

  if (fetchErr) return res.status(404).json({ error: "Staff not found" });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(profile.auth_user_id);
  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: "Staff deleted successfully" });
};

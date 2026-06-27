import supabase, { supabaseAdmin } from "../config/supabase.js";
import { sendCredentialsMail } from "../config/mailer.js";

const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@(gmail\.com|ksrce\.ac\.in)$/;
const REG_NO_REGEX = /^\d+$/;

const generatePassword = (full_name, phone) => {
  const namePart = full_name.replace(/\s+/g, '').substring(0, 4).toLowerCase();
  const phonePart = phone.replace(/\D/g, '').slice(-4);
  return `${namePart}@${phonePart}`;
};

export const registerStudent = async (req, res) => {
  try {
    const { full_name, register_no, phone, email } = req.body;

    if (!full_name || !register_no || !phone || !email)
      return res.status(400).json({ error: "All fields are required" });

    if (!NAME_REGEX.test(full_name))
      return res.status(400).json({ error: "Name must contain letters only" });

    if (!EMAIL_REGEX.test(email.trim().toLowerCase()))
      return res.status(400).json({ error: "Email must end with @gmail.com or @ksrce.ac.in" });

    if (!REG_NO_REGEX.test(register_no))
      return res.status(400).json({ error: "Register number must contain digits only" });

    if (!/^\d{10}$/.test(phone.replace(/\s/g, '')))
      return res.status(400).json({ error: "Phone must be a 10-digit number" });

    const cleanEmail = email.trim().toLowerCase();
    const password = generatePassword(full_name, phone);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ error: error.message });
    if (!data.user) return res.status(400).json({ error: "User was not created" });

    const { error: profileError } = await supabaseAdmin
      .from("student_profiles")
      .insert({ auth_user_id: data.user.id, full_name, register_no, phone, email: cleanEmail });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    await sendCredentialsMail({ to: cleanEmail, role: "student", email: cleanEmail, password }).catch(() => {});

    return res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const registerStaff = async (req, res) => {
  try {
    const { full_name, faculty_id, phone, email } = req.body;

    if (!full_name || !faculty_id || !phone || !email)
      return res.status(400).json({ error: "All fields are required" });

    if (!NAME_REGEX.test(full_name))
      return res.status(400).json({ error: "Name must contain letters only" });

    if (!EMAIL_REGEX.test(email.trim().toLowerCase()))
      return res.status(400).json({ error: "Email must end with @gmail.com or @ksrce.ac.in" });

    if (!/^\d{10}$/.test(phone.replace(/\s/g, '')))
      return res.status(400).json({ error: "Phone must be a 10-digit number" });

    const cleanEmail = email.trim().toLowerCase();
    const password = generatePassword(full_name, phone);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ error: error.message });
    if (!data.user) return res.status(400).json({ error: "User was not created" });

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert({ auth_user_id: data.user.id, full_name, faculty_id, phone, email: cleanEmail });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    await sendCredentialsMail({ to: cleanEmail, role: "staff", email: cleanEmail, password }).catch(() => {});

    return res.status(201).json({ message: "Staff registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail !== process.env.ADMIN_EMAIL.toLowerCase() ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    return res.status(200).json({
      role: "admin",
      user: { fullName: "Administrator", email: cleanEmail },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const cleanEmail = email.trim().toLowerCase();

    // Check admin first (no Supabase auth needed)
    if (
      cleanEmail === process.env.ADMIN_EMAIL?.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.status(200).json({
        role: "admin",
        user: { fullName: "Administrator", email: cleanEmail },
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const userId = data.user.id;

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("full_name, register_no, phone, email, is_blocked")
      .eq("auth_user_id", userId)
      .single();

    if (studentProfile) {
      if (studentProfile.is_blocked)
        return res.status(403).json({ error: "Your account has been blocked. Contact admin." });

      return res.status(200).json({
        role: "student",
        token: data.session.access_token,
        user: {
          fullName: studentProfile.full_name,
          email: studentProfile.email,
          idNumber: studentProfile.register_no,
          contactNo: studentProfile.phone,
        },
      });
    }

    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("full_name, faculty_id, phone, email, is_blocked")
      .eq("auth_user_id", userId)
      .single();

    if (staffProfile) {
      if (staffProfile.is_blocked)
        return res.status(403).json({ error: "Your account has been blocked. Contact admin." });

      return res.status(200).json({
        role: "staff",
        token: data.session.access_token,
        user: {
          fullName: staffProfile.full_name,
          email: staffProfile.email,
          idNumber: staffProfile.faculty_id,
          contactNo: staffProfile.phone,
        },
      });
    }

    return res.status(404).json({ error: "User profile not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

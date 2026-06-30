import supabase, { supabaseAdmin } from "../config/supabase.js";
import { sendCredentialsMail } from "../config/mailer.js";
import crypto from "crypto";

const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@(gmail\.com|ksrce\.ac\.in)$/;
const REG_NO_REGEX = /^\d+$/;

const generatePassword = (full_name, phone) => {
  const namePart = full_name.replace(/\s+/g, '').substring(0, 4).toLowerCase();
  const phonePart = phone.replace(/\D/g, '').slice(-4);
  return `${namePart}@${phonePart}`;
};

const findOrphanedAuthUser = async (email) => {
  let page = 1;
  while (true) {
    const { data: { users: batch } } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    const found = batch.find(u => {
      const a = Buffer.from((u.email || '').toLowerCase());
      const b = Buffer.from(email.toLowerCase());
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (found) return found;
    if (batch.length < 1000) break;
    page++;
  }
  return null;
};

const createAuthUser = async (cleanEmail, password) => {
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: cleanEmail, password, email_confirm: true,
  });
  if (createError && createError.message.toLowerCase().includes('already')) {
    const orphan = await findOrphanedAuthUser(cleanEmail);
    if (!orphan) throw new Error(createError.message);
    await supabaseAdmin.auth.admin.updateUserById(orphan.id, { password });
    return { authUserId: orphan.id, isNew: false };
  }
  if (createError) throw new Error(createError.message);
  if (!createData.user) throw new Error("User was not created");
  return { authUserId: createData.user.id, isNew: true };
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

    const { data: existingProfile } = await supabaseAdmin.from("student_profiles").select("id").eq("email", cleanEmail).single();
    if (existingProfile) return res.status(400).json({ error: "A student with this email is already registered" });

    const { data: existingReg } = await supabaseAdmin.from("student_profiles").select("id").eq("register_no", register_no).single();
    if (existingReg) return res.status(400).json({ error: "This register number is already assigned to another student" });

    const { data: existingPhone } = await supabaseAdmin.from("student_profiles").select("id").eq("phone", phone.replace(/\s/g, '')).single();
    if (existingPhone) return res.status(400).json({ error: "This phone number is already registered to another student" });

    const password = generatePassword(full_name, phone);
    const { authUserId, isNew } = await createAuthUser(cleanEmail, password);

    const { error: profileError } = await supabaseAdmin
      .from("student_profiles")
      .insert({ auth_user_id: authUserId, full_name, register_no, phone, email: cleanEmail });

    if (profileError) {
      if (isNew) await supabaseAdmin.auth.admin.deleteUser(authUserId);
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

    const { data: existingProfile } = await supabaseAdmin.from("staff_profiles").select("id").eq("email", cleanEmail).single();
    if (existingProfile) return res.status(400).json({ error: "A staff member with this email is already registered" });

    const { data: existingFaculty } = await supabaseAdmin.from("staff_profiles").select("id").eq("faculty_id", faculty_id).single();
    if (existingFaculty) return res.status(400).json({ error: "This staff ID is already assigned to another member" });

    const { data: existingPhone } = await supabaseAdmin.from("staff_profiles").select("id").eq("phone", phone.replace(/\s/g, '')).single();
    if (existingPhone) return res.status(400).json({ error: "This phone number is already registered to another staff member" });

    const password = generatePassword(full_name, phone);
    const { authUserId, isNew } = await createAuthUser(cleanEmail, password);

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert({ auth_user_id: authUserId, full_name, faculty_id, phone, email: cleanEmail });

    if (profileError) {
      if (isNew) await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return res.status(400).json({ error: profileError.message });
    }

    await sendCredentialsMail({ to: cleanEmail, role: "staff", email: cleanEmail, password }).catch(() => {});
    return res.status(201).json({ message: "Staff registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, phoneDigits, newPassword } = req.body;

    if (!email || !phoneDigits || !newPassword)
      return res.status(400).json({ error: "All fields are required" });
    if (!/^\d{5}$/.test(phoneDigits))
      return res.status(400).json({ error: "phoneDigits must be exactly 5 digits" });

    const cleanEmail = email.trim().toLowerCase();

    const { data: student } = await supabaseAdmin.from("student_profiles").select("auth_user_id, phone").eq("email", cleanEmail).single();
    const { data: staff } = !student ? await supabaseAdmin.from("staff_profiles").select("auth_user_id, phone").eq("email", cleanEmail).single() : { data: null };
    const profile = student || staff;

    if (!profile) return res.status(404).json({ error: "No account found with that email" });

    const storedLast5 = (profile.phone || '').replace(/\D/g, '').slice(-5);
    const storedBuf = Buffer.from(storedLast5.padEnd(5, '\0'));
    const inputBuf = Buffer.from(phoneDigits.padEnd(5, '\0'));
    const phoneMatch = storedBuf.length === inputBuf.length && crypto.timingSafeEqual(storedBuf, inputBuf);
    if (!phoneMatch)
      return res.status(401).json({ error: "Phone digits do not match our records" });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.auth_user_id, { password: newPassword });
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return res.status(401).json({ error: 'Session expired, please login again' });

    return res.status(200).json({ token: data.session.access_token, refreshToken: data.session.refresh_token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: studentProfile } = await supabaseAdmin
      .from("student_profiles").select("full_name, register_no, phone, email, is_blocked").eq("auth_user_id", userId).single();

    if (studentProfile) {
      if (studentProfile.is_blocked) return res.status(403).json({ error: "Account blocked" });
      return res.status(200).json({ role: "student", user: { fullName: studentProfile.full_name, email: studentProfile.email, idNumber: studentProfile.register_no, contactNo: studentProfile.phone } });
    }

    const { data: staffProfile } = await supabaseAdmin
      .from("staff_profiles").select("full_name, faculty_id, phone, email, is_blocked").eq("auth_user_id", userId).single();

    if (staffProfile) {
      if (staffProfile.is_blocked) return res.status(403).json({ error: "Account blocked" });
      return res.status(200).json({ role: "staff", user: { fullName: staffProfile.full_name, email: staffProfile.email, idNumber: staffProfile.faculty_id, contactNo: staffProfile.phone } });
    }

    return res.status(404).json({ error: "Profile not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email and password are required" });
    if (!password) return res.status(400).json({ error: "Email and password are required" });

    const cleanEmail = email.trim().toLowerCase();

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    if (adminEmail) {
      const emailBuf = Buffer.from(cleanEmail.padEnd(adminEmail.length || 1, '\0'));
      const adminEmailBuf = Buffer.from(adminEmail.padEnd(cleanEmail.length || 1, '\0'));
      const isAdminEmail = emailBuf.length === adminEmailBuf.length &&
        crypto.timingSafeEqual(emailBuf, adminEmailBuf);
      const passwordBuffer = Buffer.from(password);
      const adminBuffer = Buffer.from(adminPassword);
      const isAdminPassword = passwordBuffer.length === adminBuffer.length &&
        crypto.timingSafeEqual(passwordBuffer, adminBuffer);
      if (isAdminEmail && isAdminPassword)
        return res.status(200).json({ role: "admin", user: { fullName: "Administrator", email: cleanEmail } });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) return res.status(401).json({ error: error.message });

    const userId = data.user.id;

    const { data: studentProfile } = await supabase.from("student_profiles").select("full_name, register_no, phone, email, is_blocked").eq("auth_user_id", userId).single();
    if (studentProfile) {
      if (studentProfile.is_blocked) return res.status(403).json({ error: "Your account has been blocked. Contact admin." });
      return res.status(200).json({ role: "student", token: data.session.access_token, refreshToken: data.session.refresh_token, user: { fullName: studentProfile.full_name, email: studentProfile.email, idNumber: studentProfile.register_no, contactNo: studentProfile.phone } });
    }

    const { data: staffProfile } = await supabase.from("staff_profiles").select("full_name, faculty_id, phone, email, is_blocked").eq("auth_user_id", userId).single();
    if (staffProfile) {
      if (staffProfile.is_blocked) return res.status(403).json({ error: "Your account has been blocked. Contact admin." });
      return res.status(200).json({ role: "staff", token: data.session.access_token, refreshToken: data.session.refresh_token, user: { fullName: staffProfile.full_name, email: staffProfile.email, idNumber: staffProfile.faculty_id, contactNo: staffProfile.phone } });
    }

    return res.status(404).json({ error: "User profile not found" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

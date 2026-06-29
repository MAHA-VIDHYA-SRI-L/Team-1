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

// Finds orphaned auth user by email — exists in auth.users but has no profile row
const findOrphanedAuthUser = async (email) => {
  let page = 1;
  while (true) {
    const { data: { users: batch } } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    const found = batch.find(u => u.email === email);
    if (found) return found;
    if (batch.length < 1000) break;
    page++;
  }
  return null;
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

    // Check if email already exists in student_profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("email", cleanEmail)
      .single();

    if (existingProfile)
      return res.status(400).json({ error: "A student with this email is already registered" });

    // Check if register_no is already taken
    const { data: existingReg } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("register_no", register_no)
      .single();

    if (existingReg)
      return res.status(400).json({ error: "This register number is already assigned to another student" });

    const password = generatePassword(full_name, phone);

    // Try creating the auth user
    let authUserId;
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });

    if (createError && createError.message.toLowerCase().includes('already')) {
      // Auth user exists but has no profile row (orphaned) — reuse their ID and update password
      const orphan = await findOrphanedAuthUser(cleanEmail);
      if (!orphan) return res.status(400).json({ error: createError.message });
      await supabaseAdmin.auth.admin.updateUserById(orphan.id, { password });
      authUserId = orphan.id;
    } else if (createError) {
      return res.status(400).json({ error: createError.message });
    } else {
      if (!createData.user) return res.status(400).json({ error: "User was not created" });
      authUserId = createData.user.id;
    }

    const { error: profileError } = await supabaseAdmin
      .from("student_profiles")
      .insert({ auth_user_id: authUserId, full_name, register_no, phone, email: cleanEmail });

    if (profileError) {
      // Only delete auth user if we freshly created it (not if we reused an orphan)
      if (!createError) await supabaseAdmin.auth.admin.deleteUser(authUserId);
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

    // Check if email already exists in staff_profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("staff_profiles")
      .select("id")
      .eq("email", cleanEmail)
      .single();

    if (existingProfile)
      return res.status(400).json({ error: "A staff member with this email is already registered" });

    // Check if faculty_id is already taken
    const { data: existingFaculty } = await supabaseAdmin
      .from("staff_profiles")
      .select("id")
      .eq("faculty_id", faculty_id)
      .single();

    if (existingFaculty)
      return res.status(400).json({ error: "This staff ID is already assigned to another member" });

    const password = generatePassword(full_name, phone);

    // Try creating the auth user
    let authUserId;
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
    });

    if (createError && createError.message.toLowerCase().includes('already')) {
      // Auth user exists but has no profile row (orphaned) — reuse their ID and update password
      const orphan = await findOrphanedAuthUser(cleanEmail);
      if (!orphan) return res.status(400).json({ error: createError.message });
      await supabaseAdmin.auth.admin.updateUserById(orphan.id, { password });
      authUserId = orphan.id;
    } else if (createError) {
      return res.status(400).json({ error: createError.message });
    } else {
      if (!createData.user) return res.status(400).json({ error: "User was not created" });
      authUserId = createData.user.id;
    }

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .insert({ auth_user_id: authUserId, full_name, faculty_id, phone, email: cleanEmail });

    if (profileError) {
      if (!createError) await supabaseAdmin.auth.admin.deleteUser(authUserId);
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

    if (phoneDigits.length !== 5 || !/^\d{5}$/.test(phoneDigits))
      return res.status(400).json({ error: "phoneDigits must be exactly 5 digits" });

    const cleanEmail = email.trim().toLowerCase();

    const { data: student } = await supabaseAdmin
      .from("student_profiles")
      .select("auth_user_id, phone")
      .eq("email", cleanEmail)
      .single();

    let profile = student;

    if (!profile) {
      const { data: staff } = await supabaseAdmin
        .from("staff_profiles")
        .select("auth_user_id, phone")
        .eq("email", cleanEmail)
        .single();
      profile = staff;
    }

    if (!profile)
      return res.status(404).json({ error: "No account found with that email" });

    const storedLast5 = (profile.phone || '').replace(/\D/g, '').slice(-5);
    if (storedLast5 !== phoneDigits)
      return res.status(401).json({ error: "Phone digits do not match our records" });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      profile.auth_user_id,
      { password: newPassword }
    );

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Password reset successfully" });
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

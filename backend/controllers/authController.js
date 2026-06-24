import supabase from "../config/supabase.js";

export const registerStudent = async (req, res) => {
  try {
    const { full_name, register_no, phone, email, password } = req.body;

    if (!full_name || !register_no || !phone || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) return res.status(400).json({ error: error.message });
    if (!data.user) return res.status(400).json({ error: "User was not created" });

    const { error: profileError } = await supabase
      .from("student_profiles")
      .insert({ auth_user_id: data.user.id, full_name, register_no, phone, email: cleanEmail });

    if (profileError) return res.status(400).json({ error: profileError.message });

    return res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const registerStaff = async (req, res) => {
  try {
    const { full_name, faculty_id, phone, email, password } = req.body;

    if (!full_name || !faculty_id || !phone || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) return res.status(400).json({ error: error.message });
    if (!data.user) return res.status(400).json({ error: "User was not created" });

    const { error: profileError } = await supabase
      .from("staff_profiles")
      .insert({ auth_user_id: data.user.id, full_name, faculty_id, phone, email: cleanEmail });

    if (profileError) return res.status(400).json({ error: profileError.message });

    return res.status(201).json({ message: "Staff registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const userId = data.user.id;

    // Check student profile first
    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("full_name, register_no, phone, email")
      .eq("auth_user_id", userId)
      .single();

    if (studentProfile) {
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

    // Check staff profile
    const { data: staffProfile } = await supabase
      .from("staff_profiles")
      .select("full_name, faculty_id, phone, email")
      .eq("auth_user_id", userId)
      .single();

    if (staffProfile) {
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

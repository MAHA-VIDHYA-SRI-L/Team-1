import supabase, { supabaseAdmin } from "../config/supabase.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Check if user is blocked — query student first, then staff
  const userId = data.user.id;
  const { data: student } = await supabaseAdmin
    .from("student_profiles").select("is_blocked").eq("auth_user_id", userId).single();

  const profile = student ?? (await supabaseAdmin
    .from("staff_profiles").select("is_blocked").eq("auth_user_id", userId).single()).data;

  if (profile?.is_blocked) {
    return res.status(403).json({ error: "Your account has been blocked. Contact admin." });
  }

  req.user = data.user;
  next();
};

export const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

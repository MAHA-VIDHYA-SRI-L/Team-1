import { supabaseAdmin } from "../config/supabase.js";
import crypto from "crypto";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

  const userId = data.user.id;
  const { data: student } = await supabaseAdmin.from("student_profiles").select("is_blocked").eq("auth_user_id", userId).single();
  const profile = student ?? (await supabaseAdmin.from("staff_profiles").select("is_blocked").eq("auth_user_id", userId).single()).data;

  if (profile?.is_blocked) return res.status(403).json({ error: "Your account has been blocked. Contact admin." });

  req.user = data.user;
  next();
};

export const verifyStaff = async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin
      .from("staff_profiles")
      .select("id")
      .eq("auth_user_id", req.user.id)
      .single();
    if (!data) return res.status(403).json({ error: "Staff access only" });
    next();
  } catch {
    return res.status(403).json({ error: "Staff access only" });
  }
};

export const verifyStudent = async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("auth_user_id", req.user.id)
      .single();
    if (!data) return res.status(403).json({ error: "Student access only" });
    next();
  } catch {
    return res.status(403).json({ error: "Student access only" });
  }
};

export const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  if (!adminKey) return res.status(403).json({ error: "Admin access required" });
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "");
  const provided = Buffer.from(adminKey);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

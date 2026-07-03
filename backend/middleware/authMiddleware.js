import { supabaseAdmin } from "../config/supabase.js";
import crypto from "crypto";
import { getCache, setCache } from "../utils/cacheUtils.js";

const AUTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  const cachedAuth = getCache(`auth_${token}`);
  if (cachedAuth) {
    if (cachedAuth.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked. Contact admin." });
    }
    req.user = cachedAuth.user;
    req.userRole = cachedAuth.role;
    req.profileId = cachedAuth.profileId;
    return next();
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

  const userId = data.user.id;
  
  // Query student profile first
  const { data: student } = await supabaseAdmin.from("student_profiles").select("id, is_blocked").eq("auth_user_id", userId).single();
  let profile = student;
  let role = "student";
  
  // If not student, query staff profile
  if (!profile) {
    const { data: staff } = await supabaseAdmin.from("staff_profiles").select("id, is_blocked").eq("auth_user_id", userId).single();
    profile = staff;
    role = "staff";
  }

  if (profile?.is_blocked) {
    setCache(`auth_${token}`, { user: data.user, role, profileId: profile?.id, isBlocked: true }, AUTH_CACHE_TTL_MS);
    return res.status(403).json({ error: "Your account has been blocked. Contact admin." });
  }

  // Attach to req and cache
  req.user = data.user;
  req.userRole = profile ? role : "other";
  req.profileId = profile?.id || null;

  setCache(`auth_${token}`, { user: data.user, role: req.userRole, profileId: req.profileId, isBlocked: false }, AUTH_CACHE_TTL_MS);
  next();
};

export const verifyStaff = async (req, res, next) => {
  if (req.userRole === "staff" && req.profileId) {
    return next();
  }
  try {
    const { data } = await supabaseAdmin
      .from("staff_profiles")
      .select("id")
      .eq("auth_user_id", req.user.id)
      .single();
    if (!data) return res.status(403).json({ error: "Staff access only" });
    req.userRole = "staff";
    req.profileId = data.id;
    next();
  } catch {
    return res.status(403).json({ error: "Staff access only" });
  }
};

export const verifyStudent = async (req, res, next) => {
  if (req.userRole === "student" && req.profileId) {
    return next();
  }
  try {
    const { data } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("auth_user_id", req.user.id)
      .single();
    if (!data) return res.status(403).json({ error: "Student access only" });
    req.userRole = "student";
    req.profileId = data.id;
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

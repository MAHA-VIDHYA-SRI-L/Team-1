import supabase from "../config/supabase.js";

// In-memory cache store: Map<string, { value: any, expiresAt: number }>
const memoryCache = new Map();

// Default TTL: 15 minutes for IDs and role lookups
const DEFAULT_TTL_MS = 15 * 60 * 1000;

export const setCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const getCache = (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
};

export const delCache = (key) => {
  memoryCache.delete(key);
};

export const clearCache = () => {
  memoryCache.clear();
};

// Cached helper to get student database ID from Supabase auth_user_id
export const getCachedStudentId = async (authUserId) => {
  if (!authUserId) return null;
  const cacheKey = `student_id_${authUserId}`;
  const cached = getCache(cacheKey);
  if (cached !== null) return cached;

  const { data } = await supabase.from("student_profiles").select("id").eq("auth_user_id", authUserId).single();
  const id = data?.id || null;
  if (id) {
    setCache(cacheKey, id, DEFAULT_TTL_MS);
  }
  return id;
};

// Cached helper to get staff database ID from Supabase auth_user_id
export const getCachedStaffId = async (authUserId) => {
  if (!authUserId) return null;
  const cacheKey = `staff_id_${authUserId}`;
  const cached = getCache(cacheKey);
  if (cached !== null) return cached;

  const { data } = await supabase.from("staff_profiles").select("id").eq("auth_user_id", authUserId).single();
  const id = data?.id || null;
  if (id) {
    setCache(cacheKey, id, DEFAULT_TTL_MS);
  }
  return id;
};

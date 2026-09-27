import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const getEnvOrStorage = (key: string): string => {
  const envVal = import.meta.env[key]?.trim();
  if (envVal) return envVal;
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key)?.trim() || "";
    } catch {
      return "";
    }
  }
  return "";
};

const url = getEnvOrStorage("VITE_SUPABASE_URL");
const anonKey = getEnvOrStorage("VITE_SUPABASE_ANON_KEY");

/** True when the frontend has been configured with a Supabase project. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export function saveBrowserSupabaseConfig(newUrl: string, newAnonKey: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("VITE_SUPABASE_URL", newUrl.trim());
    localStorage.setItem("VITE_SUPABASE_ANON_KEY", newAnonKey.trim());
    window.location.reload();
  }
}

export function clearBrowserSupabaseConfig() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("VITE_SUPABASE_URL");
    localStorage.removeItem("VITE_SUPABASE_ANON_KEY");
    window.location.reload();
  }
}

/**
 * Shared Supabase client (anon key). All data access is protected by
 * Row Level Security; no service-role key is ever used in the browser.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

export const STORAGE_BUCKETS = {
  uploads: "consultation-uploads",
  media: "media",
} as const;

/** Normalizes any thrown value / PostgREST error into a readable message. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

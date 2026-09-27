/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (e.g. https://xxxx.supabase.co) */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/public key — safe for the browser; access is governed by RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional legacy endpoint that receives contact-form inquiries as JSON (POST). */
  readonly VITE_INQUIRY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

declare const __APP_API_BASE__: string;
declare const __APP_SUPABASE_URL__: string;
declare const __APP_SUPABASE_ANON_KEY__: string;

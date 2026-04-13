import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, __dirname, "VITE_");
  const env: Record<string, string> = { ...fileEnv };
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("VITE_") && process.env[key] != null) {
      env[key] = process.env[key] as string;
    }
  }

  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
      "[vite] Supabase vars missing after loadEnv. envDir:",
      __dirname,
      "loaded keys:",
      Object.keys(env).filter((k) => k.includes("SUPABASE")),
    );
  }

  return {
    root: __dirname,
    envDir: __dirname,
    plugins: [react()],
    // Vite ignores define() for import.meta.env.* — use dedicated globals instead.
    define: {
      __APP_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL ?? ""),
      __APP_SUPABASE_ANON_KEY__: JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ?? "",
      ),
    },
  };
});

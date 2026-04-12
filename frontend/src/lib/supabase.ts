import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // #region agent log
  fetch("http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "bd572d",
    },
    body: JSON.stringify({
      sessionId: "bd572d",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "supabase.ts:env",
      message: "missing_supabase_env",
      data: { hasUrl: Boolean(url), hasKey: Boolean(anonKey) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check frontend/.env",
  );
}

// #region agent log
fetch("http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "bd572d",
  },
  body: JSON.stringify({
    sessionId: "bd572d",
    runId: "pre-fix",
    hypothesisId: "H1",
    location: "supabase.ts:env",
    message: "supabase_env_ok",
    data: { ok: true },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const supabase = createClient(url, anonKey);
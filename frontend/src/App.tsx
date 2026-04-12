import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./Dashboard";
import { supabase } from "./lib/supabase";
import "./App.css";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd572d'},body:JSON.stringify({sessionId:'bd572d',runId:'pre-fix',hypothesisId:'H4',location:'App.tsx',message:'app_mount',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <Dashboard session={session} />;
}

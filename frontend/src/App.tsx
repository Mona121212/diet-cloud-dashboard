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

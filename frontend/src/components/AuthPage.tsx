import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setMessage(
        "Registered successfully. If email confirmation is enabled, check your inbox before signing in.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (err) setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <span className="auth-page__brand">Nutritional Insights</span>
      </header>

      <main className="auth-page__main">
        <div className="auth-card">
          <h1 className="auth-card__title">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="auth-card__subtitle">
            Use your email or continue with GitHub.
          </p>

          <form
            className="auth-form"
            onSubmit={mode === "login" ? handleLogin : handleRegister}
          >
            {mode === "register" && (
              <label className="auth-field">
                <span className="auth-field__label">Full name</span>
                <input
                  className="auth-field__input"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required={mode === "register"}
                />
              </label>
            )}
            <label className="auth-field">
              <span className="auth-field__label">Email</span>
              <input
                className="auth-field__input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="auth-field">
              <span className="auth-field__label">Password</span>
              <input
                className="auth-field__input"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </label>

            {error && (
              <p className="auth-feedback auth-feedback--error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-feedback auth-feedback--success" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary auth-form__submit"
              disabled={busy}
            >
              {mode === "login" ? "Sign in" : "Register"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn btn--github auth-github"
            onClick={() => void handleGitHubLogin()}
            disabled={busy}
          >
            Continue with GitHub
          </button>

          <p className="auth-switch">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button
                  type="button"
                  className="auth-switch__link"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setMessage("");
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-switch__link"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <footer className="auth-page__footer">
        © {new Date().getFullYear()} Nutritional Insights. All Rights Reserved.
      </footer>
    </div>
  );
}

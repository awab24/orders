import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useAuth } from "../../context/AuthContext";

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => location.state?.from?.pathname || "/", [location.state]);

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, user, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: "", error: "" });

    try {
      if (mode === "signin") {
        await signIn({ email: form.email, password: form.password });
        setStatus({ loading: false, message: "Signed in successfully.", error: "" });
        navigate(redirectTo, { replace: true });
      } else {
        const data = await signUp({ email: form.email, password: form.password });
        if (data?.session) {
          navigate(redirectTo, { replace: true });
        } else {
          setStatus({
            loading: false,
            message: "Check your email to confirm your account before signing in.",
            error: ""
          });
        }
      }
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">
          {mode === "signin"
            ? "Sign in to place orders and manage reservations."
            : "Sign up to save your details and check out faster."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={6}
              required
            />
          </label>

          <button type="submit" disabled={status.loading} className="auth-submit">
            {status.loading ? "Processing..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          {status.message && <p className="success">{status.message}</p>}
          {status.error && <p className="error-text">{status.error}</p>}
        </form>

        <div className="auth-toggle">
          <span>
            {mode === "signin" ? "New here?" : "Already have an account?"}
          </span>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>

        <Link to="/" className="auth-back">
          Back to menu
        </Link>
      </div>
    </div>
  );
};

export default Auth;

import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href =
      "http://localhost:5000/api/auth/google";
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <section className="login-brand-section">

        <div className="login-logo">
          <div className="login-logo-icon">R</div>
          <span>ReachInbox</span>
        </div>

        <div className="login-hero">
          <span className="hero-badge">
            EMAIL AUTOMATION PLATFORM
          </span>

          <h1>
            Scale your
            <br />
            <span>outreach.</span>
          </h1>

          <p>
            Schedule, automate and manage your email
            campaigns from one simple workspace.
          </p>

          <div className="login-stats">
            <div>
              <strong>200+</strong>
              <span>Emails / hour</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Automation</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Trackable</span>
            </div>
          </div>
        </div>

        <div className="login-decoration decoration-one" />
        <div className="login-decoration decoration-two" />

      </section>

      {/* RIGHT SIDE */}
      <section className="login-form-section">

        <div className="login-card">

          <div className="login-card-header">
            <h2>Welcome back</h2>

            <p>
              Sign in to your ReachInbox account
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* GOOGLE */}
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon">G</span>
            <span>Continue with Google</span>
          </button>

          <div className="login-divider">
            <span>OR</span>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

            </div>

            <div className="login-field">

              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-input">
                <Lock size={19} />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </span>

              {!loading && (
                <ArrowRight size={19} />
              )}
            </button>

          </form>

          <div className="login-footer">
            <span>Don't have an account?</span>

            <Link to="/register">
              Create account
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}
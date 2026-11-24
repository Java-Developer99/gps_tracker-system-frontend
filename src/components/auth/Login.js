import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiLogIn } from "react-icons/fi";
import api from "../../api/axios";
import "../../css/Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      const { token, role, name, email } = response.data || {};

      if (!token) {
        throw new Error("Authentication token was not returned.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("name", name || "");
      localStorage.setItem("email", email || "");

      if (role) {
        localStorage.setItem("role", role);
      }
      window.dispatchEvent(new Event("authChanged"));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="sf-login-page">
      <section className="sf-login-panel">
        <div className="sf-login-brand">
          <div className="sf-login-brand-icon">
            <FiLock />
          </div>

          <div>
            <strong>SyncFleet</strong>
            <span>Track. Manage. Move.</span>
          </div>
        </div>

        <div className="sf-login-content">

          <p className="sf-login-eyebrow">WELCOME BACK</p>

          <h1>Sign in to SyncFleet</h1>

          <p className="sf-login-description">
            Enter your account details to access your fleet workspace.
          </p>

          <form className="sf-login-form" onSubmit={handleSubmit}>
            <label htmlFor="sf-login-username">
              Username or email
            </label>

            <input
              id="sf-login-username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="sf-login-password-heading">
              <label htmlFor="sf-login-password">
                Password
              </label>
            </div>

            <div className="sf-login-password-wrap">
              <input
                id="sf-login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="sf-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {error && (
              <div className="sf-login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="sf-login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}

              {!isSubmitting && <FiLogIn />}
            </button>
          </form>

          <p className="sf-login-footer">
            Secure access to your fleet management workspace.
          </p>
        </div>

        <div className="sf-login-bottom">
          <span>© {new Date().getFullYear()} SyncFleet</span>
          <span>Fleet Management Platform</span>
        </div>
      </section>

      <aside className="sf-login-aside">
        <div className="sf-login-aside-content">
          <div className="sf-login-status">
            <span />
            FLEET OPERATIONS PLATFORM
          </div>

          <h2>Stay connected to every move.</h2>

          <p>
            Monitor vehicles, manage your fleet, and keep your
            operations moving from one workspace.
          </p>

          <div className="sf-login-feature-list">
            <div>
              <span className="sf-login-feature-mark">01</span>
              <div>
                <strong>Live fleet visibility</strong>
                <small>Keep an eye on vehicle activity.</small>
              </div>
            </div>

            <div>
              <span className="sf-login-feature-mark">02</span>
              <div>
                <strong>Centralized management</strong>
                <small>Manage your fleet structure in one place.</small>
              </div>
            </div>

            <div>
              <span className="sf-login-feature-mark">03</span>
              <div>
                <strong>Operational insights</strong>
                <small>Access reports and playback when needed.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="sf-login-aside-caption">
          TRACK WITH CLARITY. MANAGE WITH CONFIDENCE.
        </div>
      </aside>
    </main>
  );
}

export default Login;
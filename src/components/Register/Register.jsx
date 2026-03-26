import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { registerUser } from "../../utils/auth";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!accessCode.trim()) {
      setError("Organization access code is required");
      return;
    }
    setIsSubmitting(true);
    registerUser(name.trim(), email, password, accessCode.trim())
      .then(({ token, user }) => {
        login(user, token);
        navigate("/dashboard");
      })
      .catch((err) => {
        setError(err.message || "Registration failed. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="register">
      <div className="register__container">
        <h1 className="register__title">Create Account</h1>
        <p className="register__subtitle">
          Organizations only — enter your access code to register
        </p>
        <form className="register__form" onSubmit={handleSubmit}>
          <label className="register__label">
            Name
            <input
              type="text"
              className="register__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
          <label className="register__label">
            Email
            <input
              type="email"
              className="register__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="register__label">
            Password
            <input
              type="password"
              className="register__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <label className="register__label">
            Organization Access Code
            <input
              type="text"
              className="register__input"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              required
              autoComplete="off"
            />
          </label>
          {error && <p className="register__error">{error}</p>}
          <button
            type="submit"
            className="register__button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="register__login">
          Already have an account?{" "}
          <a href="/" className="register__login-link">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

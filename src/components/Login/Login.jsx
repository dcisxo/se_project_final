import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loginUser } from "../../utils/auth";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setIsSubmitting(true);
    loginUser(email, password)
      .then(({ token, user }) => {
        login(user, token);
        navigate("/dashboard");
      })
      .catch((err) => {
        setError(err.message || "Login failed. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="login">
      <div className="login__container">
        <h1 className="login__title">Sign In</h1>
        <p className="login__subtitle">Welcome back to HireRank</p>
        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__label">
            Email
            <input
              type="email"
              className="login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="login__label">
            Password
            <input
              type="password"
              className="login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </label>
          {error && <p className="login__error">{error}</p>}
          <button
            type="submit"
            className="login__button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="login__register">
          Don't have an account?{" "}
          <a href="/register" className="login__register-link">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

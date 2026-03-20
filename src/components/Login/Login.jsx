import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary mock login — will be replaced with API call
    login({ email }, "mock-jwt-token");
    navigate("/dashboard");
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
          <button type="submit" className="login__button">
            Sign In
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary mock register — will be replaced with API call
    login({ name, email }, "mock-jwt-token");
    navigate("/dashboard");
  };

  return (
    <div className="register">
      <div className="register__container">
        <h1 className="register__title">Create Account</h1>
        <p className="register__subtitle">Start ranking applicants today</p>
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
          <button type="submit" className="register__button">
            Create Account
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./NavBar.css";

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar__logo">
        HireRank
      </Link>
      <nav className="navbar__nav">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar__link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="navbar__button">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="navbar__link">
              Sign In
            </Link>
            <Link to="/register" className="navbar__link">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default NavBar;

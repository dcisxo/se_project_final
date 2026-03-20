import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./NavBar.css";

const NavBar = ({ onSearch, resultCount }) => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="navbar">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar__logo">
        HireRank
      </Link>
      {isAuthenticated && (
        <form className="navbar__search" onSubmit={handleSearch}>
          <span className="navbar__search-icon">🔍</span>
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {resultCount !== undefined && (
            <span className="navbar__search-count">{resultCount} RESULTS</span>
          )}
          <button type="submit" className="navbar__search-btn">
            Search
          </button>
        </form>
      )}
      <nav className="navbar__nav">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar__link">
              Dashboard
            </Link>
            <div
              className="navbar__profile"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="navbar__avatar"
                />
              ) : (
                <div className="navbar__avatar navbar__avatar_placeholder">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <p className="navbar__dropdown-name">{currentUser?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="navbar__dropdown-btn"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </nav>
    </header>
  );
};

export default NavBar;

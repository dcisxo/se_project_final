import { useState, useEffect } from "react";
import { checkToken } from "../utils/auth";
import { AuthContext } from "../hooks/useAuth";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setIsLoading(false);
      return;
    }
    checkToken(token)
      .then(({ user }) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Token is invalid or expired — clear it
        localStorage.removeItem("jwt");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("jwt", token);
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

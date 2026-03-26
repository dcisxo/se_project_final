import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import Dashboard from "../Dashboard/Dashboard";
import ApplicantList from "../ApplicantList/ApplicantList";
import JobBoard from "../JobBoard/JobBoard";
import JobApply from "../JobApply/JobApply";
import Login from "../Login/Login";
import Register from "../Register/Register";
import ProtectedRoute from "../ProtectedRoutes/ProtectedRoute";
import { AuthProvider } from "../../contexts/AuthContext";
import "./App.css";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resultCount, setResultCount] = useState(undefined);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <AuthProvider>
      <div className="app">
        <NavBar onSearch={handleSearch} resultCount={resultCount} />
        <main className="app__content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    searchQuery={searchQuery}
                    onResultCount={setResultCount}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicants"
              element={
                <ProtectedRoute>
                  <ApplicantList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:jobId/applicants"
              element={
                <ProtectedRoute>
                  <ApplicantList />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/board" element={<JobBoard />} />
            <Route path="/jobs/:jobId/apply" element={<JobApply />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;

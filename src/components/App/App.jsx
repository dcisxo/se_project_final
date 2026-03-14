import { Routes, Route } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import Dashboard from "../Dashboard/Dashboard";
import ApplicantList from "../ApplicantList/ApplicantList";
import Login from "../Login/Login";
import Register from "../Register/Register";
import ProtectedRoute from "../ProtectedRoutes/ProtectedRoute";
import { AuthProvider } from "../../contexts/AuthContext";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <NavBar />
        <main className="app__content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;

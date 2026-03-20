import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../JobCard/JobCard";
import { mockJobs } from "../../data/mockData";
import "./Dashboard.css";

const Dashboard = ({ searchQuery }) => {
  const [jobs] = useState(mockJobs);
  const navigate = useNavigate();

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}/applicants`);
  };

  const filteredJobs = searchQuery
    ? jobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : jobs;

  const activeJobs = filteredJobs.filter((job) => job.isActive);
  const inactiveJobs = filteredJobs.filter((job) => !job.isActive);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Job Listings</h1>
        <p className="dashboard__subtitle">
          {activeJobs.length} active position
          {activeJobs.length !== 1 ? "s" : ""}
        </p>
      </div>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Active Positions</h2>
        <div className="dashboard__grid">
          {activeJobs.map((job) => (
            <JobCard key={job._id} job={job} onClick={handleJobClick} />
          ))}
        </div>
      </section>

      {inactiveJobs.length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Closed Positions</h2>
          <div className="dashboard__grid">
            {inactiveJobs.map((job) => (
              <JobCard key={job._id} job={job} onClick={handleJobClick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

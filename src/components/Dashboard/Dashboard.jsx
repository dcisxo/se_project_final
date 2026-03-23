import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../JobCard/JobCard";
import { mockJobs } from "../../data/mockData";
import "./Dashboard.css";

const PAGE_SIZE = 3;

const Dashboard = ({ searchQuery, onResultCount }) => {
  const [jobs] = useState(mockJobs);
  const [activeVisible, setActiveVisible] = useState(PAGE_SIZE);
  const [inactiveVisible, setInactiveVisible] = useState(PAGE_SIZE);
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

  useEffect(() => {
    if (onResultCount) {
      onResultCount(filteredJobs.length);
    }
    // Reset pagination when search changes
    setActiveVisible(PAGE_SIZE);
    setInactiveVisible(PAGE_SIZE);
  }, [filteredJobs.length, onResultCount]);

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
        {activeJobs.length === 0 ? (
          <p className="dashboard__empty">Nothing found.</p>
        ) : (
          <>
            <div className="dashboard__grid">
              {activeJobs.slice(0, activeVisible).map((job, i) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onClick={handleJobClick}
                  index={i}
                />
              ))}
            </div>
            {activeVisible < activeJobs.length && (
              <button
                className="dashboard__show-more"
                onClick={() => setActiveVisible((prev) => prev + PAGE_SIZE)}
              >
                Show more
              </button>
            )}
          </>
        )}
      </section>

      {inactiveJobs.length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Closed Positions</h2>
          <div className="dashboard__grid">
            {inactiveJobs.slice(0, inactiveVisible).map((job, i) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={handleJobClick}
                index={i}
              />
            ))}
          </div>
          {inactiveVisible < inactiveJobs.length && (
            <button
              className="dashboard__show-more"
              onClick={() => setInactiveVisible((prev) => prev + PAGE_SIZE)}
            >
              Show more
            </button>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;

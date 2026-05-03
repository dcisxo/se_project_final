import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobBoardCard from "../JobBoardCard/JobBoardCard";
import Preloader from "../Preloader/Preloader";
import { getPublicJobs } from "../../utils/api";
import "./JobBoard.css";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    getPublicJobs()
      .then((data) => setJobs(data))
      .catch(() =>
        setError("Could not load job listings. Please try again later."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const departments = ["All", ...new Set(jobs.map((j) => j.department))];

  const filtered =
    activeFilter === "All"
      ? jobs
      : jobs.filter((j) => j.department === activeFilter);

  return (
    <div className="job-board">
      {/* Hero */}
      <div className="job-board__hero">
        <div className="job-board__hero-content">
          <span className="job-board__hero-eyebrow">We&apos;re Hiring</span>
          <h1 className="job-board__hero-title">Find Your Next Role</h1>
          <p className="job-board__hero-subtitle">
            Browse our open positions and apply in minutes. We review every
            application carefully.
          </p>
          {!isLoading && !error && (
            <div className="job-board__hero-stats">
              <div className="job-board__stat">
                <span className="job-board__stat-number">{jobs.length}</span>
                <span className="job-board__stat-label">Open Positions</span>
              </div>
              <div className="job-board__stat">
                <span className="job-board__stat-number">
                  {new Set(jobs.map((j) => j.department)).size}
                </span>
                <span className="job-board__stat-label">Departments</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="job-board__body">
        {isLoading ? (
          <Preloader />
        ) : error ? (
          <p className="job-board__error">{error}</p>
        ) : jobs.length === 0 ? (
          <div className="job-board__empty">
            <p className="job-board__empty-icon">📭</p>
            <p className="job-board__empty-title">
              No open positions right now
            </p>
            <p className="job-board__empty-sub">
              Check back soon — we&apos;re growing!
            </p>
          </div>
        ) : (
          <>
            {/* Department filters */}
            <div className="job-board__filters">
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`job-board__filter-btn${
                    activeFilter === dept
                      ? " job-board__filter-btn--active"
                      : ""
                  }`}
                  onClick={() => setActiveFilter(dept)}
                >
                  {dept}
                  <span className="job-board__filter-count">
                    {dept === "All"
                      ? jobs.length
                      : jobs.filter((j) => j.department === dept).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Job cards */}
            <div className="job-board__grid">
              {filtered.map((job) => (
                <JobBoardCard key={job._id} job={job} onApply={handleApply} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="job-board__no-match">
                No positions in this department right now.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobBoard;

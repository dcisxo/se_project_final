import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../JobCard/JobCard";
import JobForm from "../JobForm/JobForm";
import Preloader from "../Preloader/Preloader";
import { getJobs, createJob, updateJob } from "../../utils/api";
import "./Dashboard.css";

const PAGE_SIZE = 3;
const NETWORK_ERROR_MSG =
  "Sorry, something went wrong during the request. There may be a connection issue or the server may be down. Please try again later.";

const Dashboard = ({ searchQuery, onResultCount }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVisible, setActiveVisible] = useState(PAGE_SIZE);
  const [inactiveVisible, setInactiveVisible] = useState(PAGE_SIZE);
  // formTarget: null = closed, {} = new job, job object = editing
  const [formTarget, setFormTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getJobs()
      .then((data) => setJobs(data))
      .catch(() => setError(NETWORK_ERROR_MSG))
      .finally(() => setIsLoading(false));
  }, []);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}/applicants`);
  };

  const handleOpenNew = () => {
    setFormError(null);
    setFormTarget({});
  };

  const handleEditJob = (job) => {
    setFormError(null);
    setFormTarget(job);
  };

  const handleFormClose = () => {
    if (isSubmitting) return;
    setFormTarget(null);
    setFormError(null);
  };

  const handleFormSubmit = (payload) => {
    setIsSubmitting(true);
    setFormError(null);
    const isEdit = Boolean(formTarget?._id);
    const apiCall = isEdit
      ? updateJob(formTarget._id, payload)
      : createJob(payload);

    apiCall
      .then((savedJob) => {
        setJobs((prev) =>
          isEdit
            ? prev.map((j) => (j._id === savedJob._id ? savedJob : j))
            : [savedJob, ...prev],
        );
        setFormTarget(null);
      })
      .catch(() =>
        setFormError(
          "Failed to save the job. Make sure the server is running and try again.",
        ),
      )
      .finally(() => setIsSubmitting(false));
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
        <div>
          <h1 className="dashboard__title">Job Listings</h1>
          {!isLoading && !error && (
            <p className="dashboard__subtitle">
              {activeJobs.length} active position
              {activeJobs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button className="dashboard__new-job" onClick={handleOpenNew}>
          + New Job
        </button>
      </div>

      {isLoading ? (
        <Preloader />
      ) : error ? (
        <p className="dashboard__error">{error}</p>
      ) : (
        <>
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
                      onEdit={handleEditJob}
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
                    onEdit={handleEditJob}
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
        </>
      )}

      {formTarget !== null && (
        <JobForm
          job={formTarget._id ? formTarget : null}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          submitError={formError}
        />
      )}
    </div>
  );
};

export default Dashboard;

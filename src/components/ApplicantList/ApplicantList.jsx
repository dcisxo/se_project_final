import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApplicantCard from "../ApplicantCard/ApplicantCard";
import ApplicantForm from "../ApplicantForm/ApplicantForm";
import Preloader from "../Preloader/Preloader";
import { mockCompanies } from "../../data/mockData";
import { fetchOrgData } from "../../utils/GithubApi";
import {
  getJob,
  getJobs,
  getApplicants,
  getAllApplicants,
  createApplicant,
  updateApplicantStatus,
} from "../../utils/api";
import {
  calculateExperienceScore,
  calculateSkillsScore,
  calculateIndustryMatch,
  calculateFinalScore,
} from "../../utils/scoring";
import "./ApplicantList.css";

const PAGE_SIZE = 3;
const NETWORK_ERROR_MSG =
  "Sorry, something went wrong during the request. There may be a connection issue or the server may be down. Please try again later.";

const WEIGHT_LABELS = {
  experience: "Experience",
  skills: "Skills",
  industryMatch: "Industry Match",
  companySignals: "Company Signals",
};

const ApplicantList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [githubData, setGithubData] = useState({});
  const [error, setError] = useState(null);
  const [githubError, setGithubError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jobNotFound, setJobNotFound] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showApplicantForm, setShowApplicantForm] = useState(false);
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);
  const [applicantFormError, setApplicantFormError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setGithubError(null);
    setJobNotFound(false);

    const fetchApplicants = (rawApplicants) => {
      setApplicants(rawApplicants);

      const orgs = [
        ...new Set(
          rawApplicants
            .map(
              (a) =>
                mockCompanies.find((c) => c._id === a.currentCompany)
                  ?.githubOrg,
            )
            .filter(Boolean),
        ),
      ];

      if (orgs.length === 0) return Promise.resolve();

      return Promise.allSettled(
        orgs.map((org) => fetchOrgData(org).then((data) => ({ org, data }))),
      ).then((results) => {
        const map = {};
        let failures = 0;
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            map[result.value.org] = result.value.data;
          } else {
            failures++;
          }
        });
        if (failures > 0 && Object.keys(map).length === 0) {
          setGithubError(NETWORK_ERROR_MSG);
        } else if (failures > 0) {
          setGithubError(
            "Some company data could not be loaded. Affected scores are estimates.",
          );
        }
        setGithubData(map);
      });
    };

    if (!jobId) {
      Promise.all([getAllApplicants(), getJobs()])
        .then(([rawApplicants, jobs]) => {
          setAllJobs(jobs);
          return fetchApplicants(rawApplicants);
        })
        .catch(() => setError(NETWORK_ERROR_MSG))
        .finally(() => setIsLoading(false));
      return;
    }

    getJob(jobId)
      .then((fetchedJob) => {
        if (!fetchedJob) {
          setJobNotFound(true);
          setIsLoading(false);
          return;
        }
        setJob(fetchedJob);

        return getApplicants(jobId).then(fetchApplicants);
      })
      .catch(() => setError(NETWORK_ERROR_MSG))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  const handleAddApplicant = (payload) => {
    setIsAddingApplicant(true);
    setApplicantFormError(null);
    createApplicant(jobId, payload)
      .then((saved) => {
        setApplicants((prev) => [saved, ...prev]);
        setShowApplicantForm(false);
      })
      .catch(() =>
        setApplicantFormError(
          "Failed to save applicant. Make sure the server is running and try again.",
        ),
      )
      .finally(() => setIsAddingApplicant(false));
  };

  const handleStatusChange = (applicantId, newStatus) => {
    const targetJobId =
      jobId || applicants.find((a) => a._id === applicantId)?.jobId;
    updateApplicantStatus(targetJobId, applicantId, newStatus)
      .then((updated) => {
        setApplicants((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
      })
      .catch(() => {
        // optimistic update fallback: update locally so UI stays responsive
        setApplicants((prev) =>
          prev.map((a) =>
            a._id === applicantId ? { ...a, status: newStatus } : a,
          ),
        );
      });
  };

  if (isLoading) {
    return (
      <div className="applicant-list applicant-list--centered">
        <Preloader />
      </div>
    );
  }

  if (jobId && (jobNotFound || !job)) {
    return (
      <div className="applicant-list__error">
        <p>Job not found.</p>
        <button
          className="applicant-list__back"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // Compute live scores for each applicant then rank by finalScore
  const scoredApplicants = applicants
    .map((applicant) => {
      const mockCompany = mockCompanies.find(
        (c) => c._id === applicant.currentCompany,
      );
      const ghData = mockCompany && githubData[mockCompany.githubOrg];

      const company = ghData
        ? {
            name: ghData.name || mockCompany?.name,
            publicRepos: ghData.publicRepos,
            followers: ghData.followers,
          }
        : mockCompany;

      if (!job) {
        const applicantJob = allJobs.find(
          (j) => String(j._id) === String(applicant.jobId),
        );
        if (applicantJob) {
          const companySignals = ghData
            ? ghData.companySignalsScore
            : (applicant.categoryScores?.companySignals ?? 50);
          const categoryScores = {
            experience: calculateExperienceScore(
              applicant.experienceYears,
              applicantJob.requirements.minExperienceYears,
            ),
            skills: calculateSkillsScore(
              applicant.skills,
              applicantJob.requirements.requiredSkills,
              applicantJob.requirements.preferredSkills,
            ),
            industryMatch: calculateIndustryMatch(
              applicant.industry,
              applicantJob.requirements.industry,
            ),
            companySignals,
          };
          const finalScore = calculateFinalScore(
            categoryScores,
            applicantJob.weightConfig,
          );
          return {
            ...applicant,
            categoryScores,
            finalScore,
            _company: company,
          };
        }
        const scores = applicant.categoryScores || {};
        const vals = Object.values(scores);
        const finalScore =
          applicant.finalScore ??
          (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
        return {
          ...applicant,
          categoryScores: scores,
          finalScore,
          _company: company,
        };
      }

      const companySignals = ghData
        ? ghData.companySignalsScore
        : (applicant.categoryScores?.companySignals ?? 50);

      const categoryScores = {
        experience: calculateExperienceScore(
          applicant.experienceYears,
          job.requirements.minExperienceYears,
        ),
        skills: calculateSkillsScore(
          applicant.skills,
          job.requirements.requiredSkills,
          job.requirements.preferredSkills,
        ),
        industryMatch: calculateIndustryMatch(
          applicant.industry,
          job.requirements.industry,
        ),
        companySignals,
      };

      const finalScore = calculateFinalScore(categoryScores, job.weightConfig);

      return { ...applicant, categoryScores, finalScore, _company: company };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((a, i) => ({ ...a, rank: i + 1 }));

  const filteredApplicants =
    statusFilter === "all"
      ? scoredApplicants
      : scoredApplicants.filter(
          (a) => (a.status || "pending") === statusFilter,
        );

  const STATUS_FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "interview", label: "Interview" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="applicant-list">
      {/* Header */}
      <div className="applicant-list__header">
        <div className="applicant-list__header-top">
          <button
            className="applicant-list__back"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          {jobId && (
            <button
              className="applicant-list__add-btn"
              onClick={() => {
                setApplicantFormError(null);
                setShowApplicantForm(true);
              }}
            >
              + Add Applicant
            </button>
          )}
        </div>
        <h1 className="applicant-list__title">
          {job ? job.title : "All Applicants"}
        </h1>
        <p className="applicant-list__count">
          {scoredApplicants.length} applicant
          {scoredApplicants.length !== 1 ? "s" : ""} ranked
        </p>
        <div className="applicant-list__filters">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`applicant-list__filter-btn${statusFilter === key ? " applicant-list__filter-btn--active" : ""}`}
              onClick={() => {
                setStatusFilter(key);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              {label}
              <span className="applicant-list__filter-count">
                {key === "all"
                  ? scoredApplicants.length
                  : scoredApplicants.filter(
                      (a) => (a.status || "pending") === key,
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Job Details Card */}
      {job && (
        <div className="applicant-list__job-details">
          <div className="applicant-list__job-meta">
            <span className="applicant-list__job-meta-item">
              📍 {job.location}
            </span>
            <span className="applicant-list__job-meta-item">
              🏢 {job.department}
            </span>
            <span className="applicant-list__job-meta-item">
              🕒 {job.requirements.minExperienceYears}+ years
            </span>
            <span className="applicant-list__job-meta-item">
              🏭 {job.requirements.industry}
            </span>
            <span
              className={`applicant-list__status-badge ${job.isActive ? "applicant-list__status-badge--active" : "applicant-list__status-badge--closed"}`}
            >
              {job.isActive ? "Active" : "Closed"}
            </span>
          </div>

          {job.description && (
            <p className="applicant-list__job-description">{job.description}</p>
          )}

          <div className="applicant-list__skills-section">
            {job.requirements.requiredSkills.length > 0 && (
              <div>
                <p className="applicant-list__skills-label">Required</p>
                <ul className="applicant-list__skills-list">
                  {job.requirements.requiredSkills.map((s) => (
                    <li
                      key={s}
                      className="applicant-list__skill applicant-list__skill--required"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.requirements.preferredSkills?.length > 0 && (
              <div>
                <p className="applicant-list__skills-label">Preferred</p>
                <ul className="applicant-list__skills-list">
                  {job.requirements.preferredSkills.map((s) => (
                    <li
                      key={s}
                      className="applicant-list__skill applicant-list__skill--preferred"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Scoring Weights */}
          <div className="applicant-list__weights">
            <h3 className="applicant-list__weights-title">Scoring Weights</h3>
            <ul className="applicant-list__weights-list">
              {Object.entries(job.weightConfig).map(([key, value]) => (
                <li key={key} className="applicant-list__weight-item">
                  <span className="applicant-list__weight-label">
                    {WEIGHT_LABELS[key] || key}
                  </span>
                  <span className="applicant-list__weight-value">
                    {(value * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {githubError && (
        <div className="applicant-list__warning">
          <p>{githubError}</p>
        </div>
      )}

      {error && (
        <div className="applicant-list__warning">
          <p>{error}</p>
        </div>
      )}

      {/* Applicant Cards */}
      <div className="applicant-list__cards">
        {filteredApplicants.length === 0 ? (
          <p className="applicant-list__empty">
            {scoredApplicants.length === 0
              ? 'No applicants yet. Use "Add Applicant" to add test candidates.'
              : "No applicants match this filter."}
          </p>
        ) : (
          <>
            {filteredApplicants.slice(0, visibleCount).map((applicant) => {
              const jobTitle =
                job?.title ??
                allJobs.find((j) => String(j._id) === String(applicant.jobId))
                  ?.title;
              return (
                <ApplicantCard
                  key={applicant._id}
                  applicant={applicant}
                  company={applicant._company}
                  jobTitle={jobTitle}
                  onStatusChange={handleStatusChange}
                  compact={!jobId}
                />
              );
            })}
            {visibleCount < filteredApplicants.length && (
              <button
                className="applicant-list__show-more"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Show more
              </button>
            )}
          </>
        )}
      </div>

      {jobId && showApplicantForm && (
        <ApplicantForm
          jobTitle={job.title}
          onClose={() => setShowApplicantForm(false)}
          onSubmit={handleAddApplicant}
          isSubmitting={isAddingApplicant}
          submitError={applicantFormError}
        />
      )}
    </div>
  );
};

export default ApplicantList;

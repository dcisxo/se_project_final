import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApplicantCard from "../ApplicantCard/ApplicantCard";
import { mockApplicants, mockJobs, mockCompanies } from "../../data/mockData";
import { getCompanyData } from "../../utils/api";
import {
  calculateExperienceScore,
  calculateSkillsScore,
  calculateIndustryMatch,
  calculateFinalScore,
} from "../../utils/scoring";
import "./ApplicantList.css";

const ApplicantList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [githubData, setGithubData] = useState({}); // { orgName: { ...data, companySignalsScore } }
  const [githubError, setGithubError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const job = mockJobs.find((j) => j._id === jobId);
  const rawApplicants = mockApplicants.filter((a) => a.jobId === jobId);

  useEffect(() => {
    if (!job) {
      setIsLoading(false);
      return;
    }

    // Collect unique GitHub orgs needed for this job's applicants
    const orgs = [
      ...new Set(
        rawApplicants
          .map(
            (a) =>
              mockCompanies.find((c) => c._id === a.currentCompany)?.githubOrg,
          )
          .filter(Boolean),
      ),
    ];

    if (orgs.length === 0) {
      setIsLoading(false);
      return;
    }

    Promise.allSettled(
      orgs.map((org) => getCompanyData(org).then((data) => ({ org, data }))),
    )
      .then((results) => {
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
          setGithubError(
            "Could not load live company data from GitHub. Scores are based on estimates.",
          );
        } else if (failures > 0) {
          setGithubError(
            "Some company data could not be loaded. Affected scores are estimates.",
          );
        }
        setGithubData(map);
      })
      .finally(() => setIsLoading(false));
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!job) {
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
  const scoredApplicants = rawApplicants
    .map((applicant) => {
      const mockCompany = mockCompanies.find(
        (c) => c._id === applicant.currentCompany,
      );
      const ghData = mockCompany && githubData[mockCompany.githubOrg];

      // Use live companySignalsScore from GitHub; fall back to mock value
      const companySignals = ghData
        ? ghData.companySignalsScore
        : applicant.categoryScores.companySignals;

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

      // Prefer live GitHub data for company display; fall back to mock
      const company = ghData
        ? {
            name: ghData.name || mockCompany?.name,
            publicRepos: ghData.publicRepos,
            followers: ghData.followers,
          }
        : mockCompany;

      return { ...applicant, categoryScores, finalScore, _company: company };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((a, i) => ({ ...a, rank: i + 1 }));

  return (
    <div className="applicant-list">
      <div className="applicant-list__header">
        <button
          className="applicant-list__back"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1 className="applicant-list__title">Applicants for {job.title}</h1>
        <p className="applicant-list__count">
          {scoredApplicants.length} applicant
          {scoredApplicants.length !== 1 ? "s" : ""} ranked
        </p>
      </div>

      {githubError && (
        <div className="applicant-list__warning">
          <p>{githubError}</p>
        </div>
      )}

      <div className="applicant-list__weights">
        <h3 className="applicant-list__weights-title">Scoring Weights</h3>
        <ul className="applicant-list__weights-list">
          {Object.entries(job.weightConfig).map(([key, value]) => (
            <li key={key} className="applicant-list__weight-item">
              <span className="applicant-list__weight-label">{key}</span>
              <span className="applicant-list__weight-value">
                {(value * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="applicant-list__cards">
        {isLoading ? (
          <p className="applicant-list__loading">Loading applicant scores…</p>
        ) : scoredApplicants.length > 0 ? (
          scoredApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant._id}
              applicant={applicant}
              company={applicant._company}
            />
          ))
        ) : (
          <p className="applicant-list__empty">
            No applicants for this position yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ApplicantList;

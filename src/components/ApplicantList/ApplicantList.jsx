import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApplicantCard from "../ApplicantCard/ApplicantCard";
import { mockApplicants, mockJobs, mockCompanies } from "../../data/mockData";
import "./ApplicantList.css";

const ApplicantList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = mockJobs.find((j) => j._id === jobId);
  const applicants = mockApplicants
    .filter((a) => a.jobId === jobId)
    .sort((a, b) => a.rank - b.rank);

  const getCompany = (companyId) =>
    mockCompanies.find((c) => c._id === companyId);

  if (!job) {
    return (
      <div className="applicant-list__error">
        <p>Job not found.</p>
      </div>
    );
  }

  return (
    <div className="applicant-list">
      <div className="applicant-list__header">
        <h1 className="applicant-list__title">Applicants for {job.title}</h1>
        <p className="applicant-list__count">
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}{" "}
          ranked
        </p>
      </div>

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
        {applicants.length > 0 ? (
          applicants.map((applicant) => (
            <ApplicantCard
              key={applicant._id}
              applicant={applicant}
              company={getCompany(applicant.currentCompany)}
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

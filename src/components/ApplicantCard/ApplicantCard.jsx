import "./ApplicantCard.css";

const STATUS_LABELS = {
  pending: "Pending",
  interview: "Set for Interview",
  rejected: "Rejected",
};

const ApplicantCard = ({
  applicant,
  company,
  jobTitle,
  onStatusChange,
  compact,
}) => {
  const {
    _id,
    name,
    email,
    phone,
    rank,
    finalScore,
    experienceYears,
    skills,
    industry,
    categoryScores,
    appliedAt,
    status = "pending",
  } = applicant;

  const formattedDate = new Date(appliedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getScoreClass = (score) => {
    if (score >= 80) return "applicant-card__score--high";
    if (score >= 60) return "applicant-card__score--mid";
    return "applicant-card__score--low";
  };

  return (
    <div
      className={`applicant-card${compact ? " applicant-card--compact" : ""}`}
    >
      <div className="applicant-card__rank">#{rank}</div>
      <div className="applicant-card__body">
        <div className="applicant-card__header">
          <div>
            <h3 className="applicant-card__name">{name}</h3>
            <p className="applicant-card__email">{email}</p>
            {phone && <p className="applicant-card__phone">{phone}</p>}
          </div>
          <div className="applicant-card__header-right">
            <span
              className={`applicant-card__status-badge applicant-card__status-badge--${status}`}
            >
              {STATUS_LABELS[status]}
            </span>
            <div
              className={`applicant-card__final-score ${getScoreClass(
                finalScore,
              )}`}
            >
              <span className="applicant-card__score-value">
                {finalScore.toFixed(1)}
              </span>
              <span className="applicant-card__score-label">Score</span>
            </div>
          </div>
        </div>

        <div className="applicant-card__meta">
          <span>{experienceYears} yrs experience</span>
          <span>{industry}</span>
          {company && <span>{company.name}</span>}
          {jobTitle && (
            <span>
              Applied for: <strong>{jobTitle}</strong>
            </span>
          )}
          <span>Applied {formattedDate}</span>
        </div>

        <ul className="applicant-card__skills">
          {skills.map((skill) => (
            <li key={skill} className="applicant-card__skill-tag">
              {skill}
            </li>
          ))}
        </ul>

        <div className="applicant-card__breakdown">
          {Object.entries(categoryScores || {}).map(([category, score]) => (
            <div key={category} className="applicant-card__category">
              <span className="applicant-card__category-label">{category}</span>
              <div className="applicant-card__bar-track">
                <div
                  className={`applicant-card__bar-fill ${getScoreClass(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="applicant-card__category-score">{score}</span>
            </div>
          ))}
        </div>

        {company && (
          <div className="applicant-card__company">
            <p className="applicant-card__company-name">
              Current Company: {company.name}
            </p>
            {company.publicRepos != null && company.followers != null && (
              <p className="applicant-card__company-meta">
                {company.publicRepos} public repos &middot;{" "}
                {company.followers.toLocaleString()} followers
              </p>
            )}
          </div>
        )}

        {onStatusChange && (
          <div className="applicant-card__actions">
            <button
              className={`applicant-card__action-btn applicant-card__action-btn--interview${status === "interview" ? " applicant-card__action-btn--active" : ""}`}
              onClick={() =>
                onStatusChange(
                  _id,
                  status === "interview" ? "pending" : "interview",
                )
              }
            >
              {status === "interview" ? "✓ Interview" : "Set for Interview"}
            </button>
            <button
              className={`applicant-card__action-btn applicant-card__action-btn--reject${status === "rejected" ? " applicant-card__action-btn--active" : ""}`}
              onClick={() =>
                onStatusChange(
                  _id,
                  status === "rejected" ? "pending" : "rejected",
                )
              }
            >
              {status === "rejected" ? "✓ Rejected" : "Reject"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;

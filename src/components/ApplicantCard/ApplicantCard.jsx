import "./ApplicantCard.css";

const ApplicantCard = ({ applicant, company }) => {
  const {
    name,
    email,
    rank,
    finalScore,
    experienceYears,
    skills,
    industry,
    categoryScores,
    appliedAt,
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
    <div className="applicant-card">
      <div className="applicant-card__rank">#{rank}</div>
      <div className="applicant-card__body">
        <div className="applicant-card__header">
          <div>
            <h3 className="applicant-card__name">{name}</h3>
            <p className="applicant-card__email">{email}</p>
          </div>
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

        <div className="applicant-card__meta">
          <span>{experienceYears} yrs experience</span>
          <span>{industry}</span>
          {company && <span>{company.name}</span>}
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
          {Object.entries(categoryScores).map(([category, score]) => (
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
            <p className="applicant-card__company-meta">
              {company.publicRepos} public repos ·{" "}
              {company.followers.toLocaleString()} followers
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;

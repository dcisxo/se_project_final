import "./JobBoardCard.css";

const JobBoardCard = ({ job, onApply }) => {
  const { _id, title, department, location, description, requirements } = job;
  const { minExperienceYears, requiredSkills = [], industry } = requirements;

  const visibleSkills = requiredSkills.slice(0, 4);
  const extraCount = requiredSkills.length - visibleSkills.length;

  return (
    <div className="job-board-card" onClick={() => onApply(_id)}>
      <div className="job-board-card__top">
        <div className="job-board-card__dept-icon">
          {department?.charAt(0).toUpperCase()}
        </div>
        <span className="job-board-card__badge">Hiring Now</span>
      </div>

      <div>
        <h3 className="job-board-card__title">{title}</h3>
        <p className="job-board-card__department">{department}</p>
      </div>

      <div className="job-board-card__meta">
        <span className="job-board-card__meta-item">📍 {location}</span>
        <span className="job-board-card__meta-item">🏭 {industry}</span>
        <span className="job-board-card__meta-item">
          🕒 {minExperienceYears}+ yrs
        </span>
      </div>

      {description && (
        <p className="job-board-card__description">{description}</p>
      )}

      {visibleSkills.length > 0 && (
        <ul className="job-board-card__skills">
          {visibleSkills.map((s) => (
            <li key={s} className="job-board-card__skill">
              {s}
            </li>
          ))}
          {extraCount > 0 && (
            <li className="job-board-card__skill job-board-card__skill--more">
              +{extraCount} more
            </li>
          )}
        </ul>
      )}

      <div className="job-board-card__footer">
        <span className="job-board-card__exp">
          {minExperienceYears === 0
            ? "Entry level welcome"
            : `${minExperienceYears}+ years experience`}
        </span>
        <button
          className="job-board-card__apply-btn"
          onClick={(e) => {
            e.stopPropagation();
            onApply(_id);
          }}
        >
          Apply Now →
        </button>
      </div>
    </div>
  );
};

export default JobBoardCard;

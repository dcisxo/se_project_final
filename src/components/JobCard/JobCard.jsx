import "./JobCard.css";

const placeholderImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop",
];

const JobCard = ({ job, onClick, index = 0 }) => {
  const { _id, title, department, location, requirements, isActive } = job;
  const image = placeholderImages[index % placeholderImages.length];

  return (
    <div
      className={`job-card ${!isActive ? "job-card--inactive" : ""}`}
      onClick={() => onClick(_id)}
    >
      <div className="job-card__image-wrapper">
        <img src={image} alt={title} className="job-card__image" />
      </div>

      <div className="job-card__body">
        <h3 className="job-card__title">{title}</h3>
        <p className="job-card__description">
          {requirements.minExperienceYears}+ years experience · {department} ·{" "}
          {location}
        </p>

        <ul className="job-card__skills">
          {requirements.requiredSkills.slice(0, 3).map((skill) => (
            <li key={skill} className="job-card__skill">
              {skill}
            </li>
          ))}
          {requirements.requiredSkills.length > 3 && (
            <li className="job-card__skill">
              +{requirements.requiredSkills.length - 3} more
            </li>
          )}
        </ul>

        <div className="job-card__footer">
          <div className="job-card__author">
            <div className="job-card__avatar">
              {department?.charAt(0).toUpperCase()}
            </div>
            <span className="job-card__department">{department}</span>
          </div>
          <span
            className={`job-card__badge ${
              isActive ? "job-card__badge--active" : "job-card__badge--closed"
            }`}
          >
            {isActive ? "Active" : "Closed"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

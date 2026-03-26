import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Preloader from "../Preloader/Preloader";
import { getPublicJobById, applyToJob } from "../../utils/api";
import "./JobApply.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  experienceYears: "",
  skills: "",
  industry: "",
  currentCompany: "",
  phone: "",
  linkedinUrl: "",
  coverLetter: "",
};

const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [jobError, setJobError] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [autoRejected, setAutoRejected] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState([]);

  useEffect(() => {
    getPublicJobById(jobId)
      .then((data) => setJob(data))
      .catch(() =>
        setJobError(
          "This position could not be found or is no longer accepting applications.",
        ),
      )
      .finally(() => setIsLoadingJob(false));
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (
      form.experienceYears === "" ||
      isNaN(Number(form.experienceYears)) ||
      Number(form.experienceYears) < 0
    )
      errs.experienceYears = "Enter a valid number of years";
    if (!form.skills.trim()) errs.skills = "Enter at least one skill";
    if (!form.industry.trim()) errs.industry = "Industry is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    applyToJob(jobId, {
      name: form.name.trim(),
      email: form.email.trim(),
      experienceYears: Number(form.experienceYears),
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      industry: form.industry.trim(),
      currentCompany: form.currentCompany.trim(),
      phone: form.phone.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
      coverLetter: form.coverLetter.trim(),
    })
      .then((data) => {
        if (data.autoRejected) {
          setAutoRejected(true);
          setRejectionReasons(data.rejectionReasons || []);
        }
        setSubmitted(true);
      })
      .catch((err) =>
        setSubmitError(
          err.message || "Something went wrong. Please try again.",
        ),
      )
      .finally(() => setIsSubmitting(false));
  };

  if (isLoadingJob) {
    return (
      <div className="job-apply">
        <Preloader />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="job-apply">
        <button
          className="job-apply__back"
          onClick={() => navigate("/jobs/board")}
        >
          ← Back to Job Board
        </button>
        <p className="job-apply__submit-error">
          {jobError || "Job not found."}
        </p>
      </div>
    );
  }

  if (submitted && autoRejected) {
    return (
      <div className="job-apply">
        <div className="job-apply__rejected">
          <div className="job-apply__rejected-icon">✗</div>
          <h2 className="job-apply__rejected-title">
            Application Not Advancing
          </h2>
          <p className="job-apply__rejected-msg">
            Thank you for applying to <strong>{job.title}</strong>.
            Unfortunately your application did not meet the mandatory
            requirements for this role:
          </p>
          <ul className="job-apply__rejected-reasons">
            {rejectionReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <button
            className="job-apply__success-btn"
            onClick={() => navigate("/jobs/board")}
          >
            View Other Openings
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="job-apply">
        <div className="job-apply__success">
          <div className="job-apply__success-icon">🎉</div>
          <h2 className="job-apply__success-title">Application Submitted!</h2>
          <p className="job-apply__success-msg">
            Thanks for applying to <strong>{job.title}</strong>. We&apos;ll be
            in touch soon.
          </p>
          <button
            className="job-apply__success-btn"
            onClick={() => navigate("/jobs/board")}
          >
            View Other Openings
          </button>
        </div>
      </div>
    );
  }

  const reqChecks = (() => {
    const applicantSkills = form.skills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const reqSkills = job.requirements.requiredSkills ?? [];
    return [
      {
        label: `${job.requirements.minExperienceYears}+ years of experience`,
        met:
          form.experienceYears !== "" &&
          !isNaN(Number(form.experienceYears)) &&
          Number(form.experienceYears) >= job.requirements.minExperienceYears,
      },
      {
        label: `Industry: ${job.requirements.industry}`,
        met:
          form.industry.trim().toLowerCase() ===
          job.requirements.industry.toLowerCase(),
      },
      ...(reqSkills.length > 0
        ? [
            {
              label: `At least one required skill (${reqSkills.slice(0, 3).join(", ")}${reqSkills.length > 3 ? "\u2026" : ""})`,
              met: applicantSkills.some((s) =>
                reqSkills.map((r) => r.toLowerCase()).includes(s),
              ),
            },
          ]
        : []),
    ];
  })();

  return (
    <div className="job-apply">
      <button
        className="job-apply__back"
        onClick={() => navigate("/jobs/board")}
      >
        ← Back to Job Board
      </button>

      {/* Job Details */}
      <div className="job-apply__job-details">
        <h1 className="job-apply__job-title">{job.title}</h1>
        <div className="job-apply__job-meta">
          <span className="job-apply__job-meta-item">📍 {job.location}</span>
          <span className="job-apply__job-meta-item">🏢 {job.department}</span>
          <span className="job-apply__job-meta-item">
            🕒 {job.requirements.minExperienceYears}+ years experience
          </span>
          <span className="job-apply__job-meta-item">
            🏭 {job.requirements.industry}
          </span>
        </div>
        {job.description && (
          <p className="job-apply__job-description">{job.description}</p>
        )}
        {job.requirements.requiredSkills?.length > 0 && (
          <>
            <p className="job-apply__skills-label">Required Skills</p>
            <ul className="job-apply__skills-list">
              {job.requirements.requiredSkills.map((s) => (
                <li key={s} className="job-apply__skill">
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}
        {job.requirements.preferredSkills?.length > 0 && (
          <>
            <p className="job-apply__skills-label">Preferred Skills</p>
            <ul className="job-apply__skills-list">
              {job.requirements.preferredSkills.map((s) => (
                <li
                  key={s}
                  className="job-apply__skill job-apply__skill--preferred"
                >
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Mandatory Requirements Checklist */}
      <div className="job-apply__requirements">
        <p className="job-apply__requirements-label">Mandatory Requirements</p>
        <ul className="job-apply__requirements-list">
          {reqChecks.map((check, i) => (
            <li
              key={i}
              className={`job-apply__req-item ${
                check.met
                  ? "job-apply__req-item--met"
                  : "job-apply__req-item--unmet"
              }`}
            >
              <span className="job-apply__req-icon">
                {check.met ? "✓" : "✗"}
              </span>
              {check.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Application Form */}
      <h2 className="job-apply__form-heading">Your Application</h2>
      <form className="job-apply__form" onSubmit={handleSubmit} noValidate>
        <div className="job-apply__row">
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-name">
              Full Name <span className="job-apply__required">*</span>
            </label>
            <input
              id="ja-name"
              className={`job-apply__input ${errors.name ? "job-apply__input--error" : ""}`}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Rivera"
            />
            {errors.name && (
              <span className="job-apply__error-msg">{errors.name}</span>
            )}
          </div>
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-email">
              Email <span className="job-apply__required">*</span>
            </label>
            <input
              id="ja-email"
              type="email"
              className={`job-apply__input ${errors.email ? "job-apply__input--error" : ""}`}
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@example.com"
            />
            {errors.email && (
              <span className="job-apply__error-msg">{errors.email}</span>
            )}
          </div>
        </div>

        <div className="job-apply__row">
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-experienceYears">
              Years of Experience <span className="job-apply__required">*</span>
            </label>
            <input
              id="ja-experienceYears"
              type="number"
              className={`job-apply__input ${errors.experienceYears ? "job-apply__input--error" : ""}`}
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleChange}
              min="0"
              placeholder="3"
            />
            {errors.experienceYears && (
              <span className="job-apply__error-msg">
                {errors.experienceYears}
              </span>
            )}
          </div>
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-industry">
              Industry <span className="job-apply__required">*</span>
            </label>
            <input
              id="ja-industry"
              className={`job-apply__input ${errors.industry ? "job-apply__input--error" : ""}`}
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Healthcare, Finance, Retail"
            />
            {errors.industry && (
              <span className="job-apply__error-msg">{errors.industry}</span>
            )}
          </div>
        </div>

        <div className="job-apply__field">
          <label className="job-apply__label" htmlFor="ja-skills">
            Skills <span className="job-apply__required">*</span>{" "}
            <span className="job-apply__hint">(comma-separated)</span>
          </label>
          <input
            id="ja-skills"
            className={`job-apply__input ${errors.skills ? "job-apply__input--error" : ""}`}
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g. Communication, Leadership, Sales"
          />
          {errors.skills && (
            <span className="job-apply__error-msg">{errors.skills}</span>
          )}
        </div>

        <div className="job-apply__field">
          <label className="job-apply__label" htmlFor="ja-currentCompany">
            Current Company <span className="job-apply__hint">(optional)</span>
          </label>
          <input
            id="ja-currentCompany"
            className="job-apply__input"
            name="currentCompany"
            value={form.currentCompany}
            onChange={handleChange}
            placeholder="Acme Corp"
          />
        </div>

        <div className="job-apply__row">
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-phone">
              Phone Number <span className="job-apply__hint">(optional)</span>
            </label>
            <input
              id="ja-phone"
              type="tel"
              className="job-apply__input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="job-apply__field">
            <label className="job-apply__label" htmlFor="ja-linkedinUrl">
              LinkedIn / Portfolio URL{" "}
              <span className="job-apply__hint">(optional)</span>
            </label>
            <input
              id="ja-linkedinUrl"
              type="url"
              className="job-apply__input"
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </div>

        <div className="job-apply__field">
          <label className="job-apply__label" htmlFor="ja-coverLetter">
            Cover Letter / Brief Statement{" "}
            <span className="job-apply__hint">(optional)</span>
          </label>
          <textarea
            id="ja-coverLetter"
            className="job-apply__input job-apply__textarea"
            name="coverLetter"
            value={form.coverLetter}
            onChange={handleChange}
            rows={5}
            placeholder="Tell us about yourself and why you're a great fit for this role…"
          />
        </div>

        {submitError && (
          <p className="job-apply__submit-error">{submitError}</p>
        )}

        <button
          type="submit"
          className="job-apply__submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default JobApply;

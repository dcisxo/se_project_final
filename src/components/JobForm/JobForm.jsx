import { useState } from "react";
import "./JobForm.css";

const DEFAULT_WEIGHTS = {
  experience: 0.3,
  skills: 0.4,
  industryMatch: 0.2,
  companySignals: 0.1,
};

const WEIGHT_LABELS = {
  experience: "Experience",
  skills: "Skills",
  industryMatch: "Industry Match",
  companySignals: "Company Signals",
};

const buildInitialForm = (job) => {
  if (!job) {
    return {
      title: "",
      department: "",
      location: "",
      description: "",
      minExperienceYears: "",
      requiredSkills: "",
      preferredSkills: "",
      industry: "",
      weightConfig: { ...DEFAULT_WEIGHTS },
      isActive: true,
    };
  }
  return {
    title: job.title || "",
    department: job.department || "",
    location: job.location || "",
    description: job.description || "",
    minExperienceYears: job.requirements?.minExperienceYears ?? "",
    requiredSkills: job.requirements?.requiredSkills?.join(", ") || "",
    preferredSkills: job.requirements?.preferredSkills?.join(", ") || "",
    industry: job.requirements?.industry || "",
    weightConfig: {
      experience: job.weightConfig?.experience ?? DEFAULT_WEIGHTS.experience,
      skills: job.weightConfig?.skills ?? DEFAULT_WEIGHTS.skills,
      industryMatch:
        job.weightConfig?.industryMatch ?? DEFAULT_WEIGHTS.industryMatch,
      companySignals:
        job.weightConfig?.companySignals ?? DEFAULT_WEIGHTS.companySignals,
    },
    isActive: job.isActive !== undefined ? job.isActive : true,
  };
};

const JobForm = ({ job, onClose, onSubmit, isSubmitting, submitError }) => {
  const isEdit = Boolean(job?._id);
  const [form, setForm] = useState(() => buildInitialForm(job));
  const [errors, setErrors] = useState({});

  const weightSum = Object.values(form.weightConfig).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0,
  );
  const weightSumValid = Math.abs(weightSum - 1) < 0.005;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      weightConfig: {
        ...prev.weightConfig,
        [name]: parseFloat(value) || 0,
      },
    }));
    setErrors((prev) => ({ ...prev, weights: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.department.trim()) errs.department = "Department is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (
      form.minExperienceYears === "" ||
      isNaN(Number(form.minExperienceYears))
    )
      errs.minExperienceYears = "A valid number is required";
    if (!form.industry.trim()) errs.industry = "Industry is required";
    if (!form.requiredSkills.trim())
      errs.requiredSkills = "At least one required skill";
    if (!weightSumValid) errs.weights = "Weights must sum to exactly 1.0";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      department: form.department.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      requirements: {
        minExperienceYears: Number(form.minExperienceYears),
        requiredSkills: form.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferredSkills: form.preferredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        industry: form.industry.trim(),
      },
      weightConfig: form.weightConfig,
      isActive: form.isActive,
    });
  };

  return (
    <div className="job-form__overlay" onClick={onClose}>
      <div className="job-form__modal" onClick={(e) => e.stopPropagation()}>
        <div className="job-form__header">
          <h2 className="job-form__heading">
            {isEdit ? "Edit Job Posting" : "New Job Posting"}
          </h2>
          <button
            type="button"
            className="job-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="job-form__body" onSubmit={handleSubmit} noValidate>
          {/* Basic Information */}
          <section className="job-form__section">
            <h3 className="job-form__section-title">Basic Information</h3>
            <div className="job-form__row">
              <div className="job-form__field">
                <label className="job-form__label" htmlFor="jf-title">
                  Title <span className="job-form__required">*</span>
                </label>
                <input
                  id="jf-title"
                  className={`job-form__input ${errors.title ? "job-form__input--error" : ""}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Engineer"
                />
                {errors.title && (
                  <span className="job-form__error-msg">{errors.title}</span>
                )}
              </div>
              <div className="job-form__field">
                <label className="job-form__label" htmlFor="jf-department">
                  Department <span className="job-form__required">*</span>
                </label>
                <input
                  id="jf-department"
                  className={`job-form__input ${errors.department ? "job-form__input--error" : ""}`}
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                />
                {errors.department && (
                  <span className="job-form__error-msg">
                    {errors.department}
                  </span>
                )}
              </div>
            </div>

            <div className="job-form__field">
              <label className="job-form__label" htmlFor="jf-location">
                Location <span className="job-form__required">*</span>
              </label>
              <input
                id="jf-location"
                className={`job-form__input ${errors.location ? "job-form__input--error" : ""}`}
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
              />
              {errors.location && (
                <span className="job-form__error-msg">{errors.location}</span>
              )}
            </div>

            <div className="job-form__field">
              <label className="job-form__label" htmlFor="jf-description">
                Description <span className="job-form__required">*</span>
              </label>
              <textarea
                id="jf-description"
                className={`job-form__textarea ${errors.description ? "job-form__input--error" : ""}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the role and responsibilities…"
              />
              {errors.description && (
                <span className="job-form__error-msg">
                  {errors.description}
                </span>
              )}
            </div>
          </section>

          {/* Requirements */}
          <section className="job-form__section">
            <h3 className="job-form__section-title">Requirements</h3>
            <div className="job-form__row">
              <div className="job-form__field">
                <label
                  className="job-form__label"
                  htmlFor="jf-minExperienceYears"
                >
                  Min. Experience (years){" "}
                  <span className="job-form__required">*</span>
                </label>
                <input
                  id="jf-minExperienceYears"
                  type="number"
                  className={`job-form__input ${errors.minExperienceYears ? "job-form__input--error" : ""}`}
                  name="minExperienceYears"
                  value={form.minExperienceYears}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
                {errors.minExperienceYears && (
                  <span className="job-form__error-msg">
                    {errors.minExperienceYears}
                  </span>
                )}
              </div>
              <div className="job-form__field">
                <label className="job-form__label" htmlFor="jf-industry">
                  Industry <span className="job-form__required">*</span>
                </label>
                <input
                  id="jf-industry"
                  className={`job-form__input ${errors.industry ? "job-form__input--error" : ""}`}
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software / SaaS"
                />
                {errors.industry && (
                  <span className="job-form__error-msg">{errors.industry}</span>
                )}
              </div>
            </div>

            <div className="job-form__field">
              <label className="job-form__label" htmlFor="jf-requiredSkills">
                Required Skills <span className="job-form__required">*</span>{" "}
                <span className="job-form__hint">(comma-separated)</span>
              </label>
              <input
                id="jf-requiredSkills"
                className={`job-form__input ${errors.requiredSkills ? "job-form__input--error" : ""}`}
                name="requiredSkills"
                value={form.requiredSkills}
                onChange={handleChange}
                placeholder="React, Node.js, SQL"
              />
              {errors.requiredSkills && (
                <span className="job-form__error-msg">
                  {errors.requiredSkills}
                </span>
              )}
            </div>

            <div className="job-form__field">
              <label className="job-form__label" htmlFor="jf-preferredSkills">
                Preferred Skills{" "}
                <span className="job-form__hint">(comma-separated)</span>
              </label>
              <input
                id="jf-preferredSkills"
                className="job-form__input"
                name="preferredSkills"
                value={form.preferredSkills}
                onChange={handleChange}
                placeholder="TypeScript, Docker, Redis"
              />
            </div>
          </section>

          {/* Scoring Weights */}
          <section className="job-form__section">
            <h3 className="job-form__section-title">
              Scoring Weights{" "}
              <span className="job-form__hint">(must sum to 1.0)</span>
            </h3>
            <div className="job-form__weights-grid">
              {Object.keys(form.weightConfig).map((key) => (
                <div className="job-form__field" key={key}>
                  <label className="job-form__label" htmlFor={`jf-w-${key}`}>
                    {WEIGHT_LABELS[key]}
                  </label>
                  <input
                    id={`jf-w-${key}`}
                    type="number"
                    className="job-form__input"
                    name={key}
                    value={form.weightConfig[key]}
                    onChange={handleWeightChange}
                    step="0.05"
                    min="0"
                    max="1"
                  />
                </div>
              ))}
            </div>
            <p
              className={`job-form__weight-sum ${
                weightSumValid
                  ? "job-form__weight-sum--ok"
                  : "job-form__weight-sum--bad"
              }`}
            >
              Sum: {weightSum.toFixed(2)}{" "}
              {weightSumValid ? "✓" : "— must equal 1.0"}
            </p>
            {errors.weights && (
              <span className="job-form__error-msg">{errors.weights}</span>
            )}
          </section>

          {/* Status */}
          <section className="job-form__section">
            <label className="job-form__checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="job-form__checkbox"
              />
              <span>Active — visible to applicants</span>
            </label>
          </section>

          {submitError && (
            <p className="job-form__submit-error">{submitError}</p>
          )}

          <div className="job-form__footer">
            <button
              type="button"
              className="job-form__btn job-form__btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="job-form__btn job-form__btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save Changes"
                  : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;

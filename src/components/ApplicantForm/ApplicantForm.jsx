import { useState } from "react";
import "./ApplicantForm.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  experienceYears: "",
  skills: "",
  industry: "",
  githubOrg: "",
};

const ApplicantForm = ({
  jobTitle,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

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
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      experienceYears: Number(form.experienceYears),
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      industry: form.industry.trim(),
      githubOrg: form.githubOrg.trim(),
    });
  };

  return (
    <div className="applicant-form__overlay" onClick={onClose}>
      <div
        className="applicant-form__modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="applicant-form__header">
          <div>
            <h2 className="applicant-form__heading">Add Test Applicant</h2>
            <p className="applicant-form__subheading">for {jobTitle}</p>
          </div>
          <button
            type="button"
            className="applicant-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          className="applicant-form__body"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="applicant-form__row">
            <div className="applicant-form__field">
              <label className="applicant-form__label" htmlFor="af-name">
                Full Name <span className="applicant-form__required">*</span>
              </label>
              <input
                id="af-name"
                className={`applicant-form__input ${errors.name ? "applicant-form__input--error" : ""}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
              />
              {errors.name && (
                <span className="applicant-form__error-msg">{errors.name}</span>
              )}
            </div>
            <div className="applicant-form__field">
              <label className="applicant-form__label" htmlFor="af-email">
                Email <span className="applicant-form__required">*</span>
              </label>
              <input
                id="af-email"
                type="email"
                className={`applicant-form__input ${errors.email ? "applicant-form__input--error" : ""}`}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alex@example.com"
              />
              {errors.email && (
                <span className="applicant-form__error-msg">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div className="applicant-form__row">
            <div className="applicant-form__field">
              <label
                className="applicant-form__label"
                htmlFor="af-experienceYears"
              >
                Years of Experience{" "}
                <span className="applicant-form__required">*</span>
              </label>
              <input
                id="af-experienceYears"
                type="number"
                className={`applicant-form__input ${errors.experienceYears ? "applicant-form__input--error" : ""}`}
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                min="0"
                placeholder="3"
              />
              {errors.experienceYears && (
                <span className="applicant-form__error-msg">
                  {errors.experienceYears}
                </span>
              )}
            </div>
            <div className="applicant-form__field">
              <label className="applicant-form__label" htmlFor="af-industry">
                Industry <span className="applicant-form__required">*</span>
              </label>
              <input
                id="af-industry"
                className={`applicant-form__input ${errors.industry ? "applicant-form__input--error" : ""}`}
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. Healthcare, Finance, Retail"
              />
              {errors.industry && (
                <span className="applicant-form__error-msg">
                  {errors.industry}
                </span>
              )}
            </div>
          </div>

          <div className="applicant-form__field">
            <label className="applicant-form__label" htmlFor="af-skills">
              Skills <span className="applicant-form__required">*</span>{" "}
              <span className="applicant-form__hint">(comma-separated)</span>
            </label>
            <input
              id="af-skills"
              className={`applicant-form__input ${errors.skills ? "applicant-form__input--error" : ""}`}
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. Communication, Leadership, Sales"
            />
            {errors.skills && (
              <span className="applicant-form__error-msg">{errors.skills}</span>
            )}
          </div>

          <div className="applicant-form__field">
            <label className="applicant-form__label" htmlFor="af-githubOrg">
              Employer&apos;s GitHub Org{" "}
              <span className="applicant-form__hint">
                (optional — used for scoring)
              </span>
            </label>
            <input
              id="af-githubOrg"
              className="applicant-form__input"
              name="githubOrg"
              value={form.githubOrg}
              onChange={handleChange}
              placeholder="e.g. microsoft, vercel, stripe"
            />
          </div>

          {submitError && (
            <p className="applicant-form__submit-error">{submitError}</p>
          )}

          <div className="applicant-form__footer">
            <button
              type="button"
              className="applicant-form__btn applicant-form__btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="applicant-form__btn applicant-form__btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding…" : "Add Applicant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;

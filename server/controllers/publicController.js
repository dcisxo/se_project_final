const Applicant = require("../models/Applicant");
const Job = require("../models/Job");
const { fetchOrgData } = require("../utils/githubApi");
const { calculateCompanySignalsScore } = require("../utils/scoringEngine");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPublicJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .select("-createdBy")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

const getPublicJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      isActive: true,
    }).select("-createdBy");
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or no longer accepting applications" });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, isActive: true });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or no longer accepting applications" });
    }

    const {
      name,
      email,
      experienceYears,
      skills,
      industry,
      currentCompany,
      githubOrg,
      phone,
      linkedinUrl,
      coverLetter,
    } = req.body;

    if (
      !name ||
      !email ||
      experienceYears == null ||
      !skills?.length ||
      !industry
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Auto-reject if any of the 3 mandatory requirements aren't met
    const rejectionReasons = [];
    if (Number(experienceYears) < job.requirements.minExperienceYears) {
      rejectionReasons.push(
        `Requires at least ${job.requirements.minExperienceYears} year(s) of experience`,
      );
    }
    if (
      job.requirements.industry &&
      industry.trim().toLowerCase() !== job.requirements.industry.toLowerCase()
    ) {
      rejectionReasons.push(`Industry must be "${job.requirements.industry}"`);
    }
    if (job.requirements.requiredSkills?.length > 0) {
      const normalizedApplicant = (
        Array.isArray(skills) ? skills : [skills]
      ).map((s) => s.toLowerCase().trim());
      const hasRequired = job.requirements.requiredSkills.some((s) =>
        normalizedApplicant.includes(s.toLowerCase().trim()),
      );
      if (!hasRequired) {
        rejectionReasons.push(
          `Must have at least one required skill (${job.requirements.requiredSkills.slice(0, 3).join(", ")}${job.requirements.requiredSkills.length > 3 ? "…" : ""})`,
        );
      }
    }

    // Look up the applicant's current employer on GitHub to compute company signals score
    let companySignalsScore = null;
    if (githubOrg && githubOrg.trim()) {
      try {
        const orgData = await fetchOrgData(githubOrg.trim());
        companySignalsScore = calculateCompanySignalsScore(
          orgData.publicRepos,
          orgData.followers,
        );
      } catch {
        // GitHub lookup failed — score stays null (defaults to 50 at scoring time)
      }
    }

    const applicant = new Applicant({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      jobId: req.params.jobId,
      experienceYears: Number(experienceYears),
      skills: Array.isArray(skills) ? skills : [skills],
      industry: industry.trim(),
      currentCompany: currentCompany ? currentCompany.trim() : "",
      githubOrg: githubOrg ? githubOrg.trim() : "",
      companySignalsScore,
      phone: phone ? phone.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      coverLetter: coverLetter ? coverLetter.trim() : "",
      status: rejectionReasons.length > 0 ? "rejected" : "pending",
    });

    await applicant.save();
    res.status(201).json({
      message:
        rejectionReasons.length > 0
          ? "Application received but did not meet mandatory requirements."
          : "Application submitted successfully",
      applicantId: applicant._id,
      autoRejected: rejectionReasons.length > 0,
      rejectionReasons,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicJobs, getPublicJobById, applyToJob };

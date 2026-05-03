import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import { fetchOrgData } from "../utils/githubApi.js";
import { calculateCompanySignalsScore } from "../utils/scoringEngine.js";

const getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const applicants = await Applicant.find({ jobId: req.params.jobId }).sort({
      appliedAt: -1,
    });
    res.json(applicants);
  } catch (err) {
    next(err);
  }
};

const createApplicant = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const {
      name,
      email,
      experienceYears,
      skills,
      industry,
      currentCompany,
      githubOrg,
    } = req.body;

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
      name,
      email,
      jobId: req.params.jobId,
      experienceYears,
      skills,
      industry,
      currentCompany: currentCompany || "",
      githubOrg: githubOrg ? githubOrg.trim() : "",
      companySignalsScore,
    });
    await applicant.save();
    res.status(201).json(applicant);
  } catch (err) {
    next(err);
  }
};

const updateApplicantStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const applicant = await Applicant.findOneAndUpdate(
      { _id: req.params.applicantId, jobId: req.params.jobId },
      { status },
      { new: true, runValidators: true },
    );
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    res.json(applicant);
  } catch (err) {
    next(err);
  }
};

const getAllApplicants = async (req, res, next) => {
  try {
    const applicants = await Applicant.find({}).sort({ appliedAt: -1 });
    res.json(applicants);
  } catch (err) {
    next(err);
  }
};

export {
  getApplicants,
  createApplicant,
  updateApplicantStatus,
  getAllApplicants,
};

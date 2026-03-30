import { fetchOrgData } from "../utils/githubApi";
import { calculateCompanySignalsScore } from "../utils/scoringEngine";
import Job, { find, findByIdAndUpdate, findById } from "../models/Job";

// Only allow valid GitHub org name characters
const VALID_ORG_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,37}$/;

const getCompanyData = async (req, res, next) => {
  try {
    const { orgName } = req.params;
    if (!VALID_ORG_RE.test(orgName)) {
      return res.status(400).json({ message: "Invalid organization name" });
    }
    const orgData = await fetchOrgData(orgName);
    const companySignalsScore = calculateCompanySignalsScore(
      orgData.publicRepos,
      orgData.followers,
    );
    res.json({ ...orgData, companySignalsScore });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: "GitHub organization not found" });
    }
    if (err.response?.status === 403 || err.response?.status === 429) {
      return res
        .status(503)
        .json({ message: "GitHub API rate limit exceeded. Try again later." });
    }
    next(err);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const jobs = await find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      description,
      requirements,
      weightConfig,
      isActive,
    } = req.body;
    const job = new Job({
      title,
      department,
      location,
      description,
      requirements,
      weightConfig,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      location,
      description,
      requirements,
      weightConfig,
      isActive,
    } = req.body;
    const job = await findByIdAndUpdate(
      id,
      {
        title,
        department,
        location,
        description,
        requirements,
        weightConfig,
        isActive,
      },
      { new: true, runValidators: true },
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
};

export default { getCompanyData, getJobs, getJobById, createJob, updateJob };

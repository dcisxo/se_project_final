const { fetchOrgData } = require("../utils/githubApi");
const { calculateCompanySignalsScore } = require("../utils/scoringEngine");

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

module.exports = { getCompanyData };

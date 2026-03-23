/**
 * Calculates a 0-100 company signals score from GitHub org metrics.
 * Thresholds are calibrated so that large orgs (Google, Microsoft) score high
 * and smaller but quality orgs (Vercel) score in the mid range.
 *
 * Repo score: scaled against 5000 repos as ceiling (captures enterprise scale)
 * Follower score: scaled against 50000 followers as ceiling
 * Weights: repos 40%, followers 60%
 */
const calculateCompanySignalsScore = (publicRepos, followers) => {
  const repoScore = Math.min(100, (publicRepos / 5000) * 100);
  const followerScore = Math.min(100, (followers / 50000) * 100);
  return Math.round(repoScore * 0.4 + followerScore * 0.6);
};

module.exports = { calculateCompanySignalsScore };

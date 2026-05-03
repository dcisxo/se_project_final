/**
 * GithubApi.js
 * All requests to the GitHub REST API v3 (third-party service).
 * Uses vanilla fetch() — no additional libraries required.
 */

const GITHUB_BASE_URL = "https://api.github.com";

const githubRequest = (endpoint) =>
  fetch(`${GITHUB_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || `GitHub API error: ${res.status}`);
      });
    }
    return res.json();
  });

/**
 * Fetch public organisation data from GitHub.
 * @param {string} orgName - GitHub organisation login (e.g. "vercel")
 * @returns {Promise<object>} Normalised org data including a companySignalsScore
 */
export const fetchOrgData = (orgName) =>
  githubRequest(`/orgs/${orgName}`).then((data) => {
    const publicRepos = data.public_repos ?? 0;
    const followers = data.followers ?? 0;

    // Score calibrated against large orgs (5 000 repos / 50 000 followers ceiling)
    const repoScore = Math.min(100, (publicRepos / 5000) * 100);
    const followerScore = Math.min(100, (followers / 50000) * 100);
    const companySignalsScore = Math.round(
      repoScore * 0.4 + followerScore * 0.6,
    );

    return {
      login: data.login,
      name: data.name || data.login,
      description: data.description,
      location: data.location,
      blog: data.blog,
      publicRepos,
      followers,
      avatarUrl: data.avatar_url,
      companySignalsScore,
    };
  });

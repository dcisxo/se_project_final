const axios = require("axios");

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 8000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

githubClient.interceptors.request.use((config) => {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const fetchOrgData = async (orgName) => {
  const { data } = await githubClient.get(`/orgs/${orgName}`);
  return {
    login: data.login,
    name: data.name || data.login,
    description: data.description,
    location: data.location,
    blog: data.blog,
    publicRepos: data.public_repos,
    followers: data.followers,
    avatarUrl: data.avatar_url,
  };
};

module.exports = { fetchOrgData };

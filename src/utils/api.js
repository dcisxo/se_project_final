import { mockJobs, mockApplicants } from "../data/mockData";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : "/api";

const request = (endpoint, options = {}) => {
  const token = localStorage.getItem("jwt");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers }).then(
    (res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          let message;
          try {
            message = JSON.parse(text).message;
          } catch {
            message = text;
          }
          throw new Error(message || `Server error: ${res.status}`);
        });
      }
      return res.json();
    },
  );
};

export const getCompanyData = (orgName) => request(`/github/${orgName}`);

export const getJobs = () =>
  request("/jobs").catch(() => Promise.resolve(mockJobs));

export const getJob = (jobId) =>
  request(`/jobs/${jobId}`).catch(() =>
    Promise.resolve(mockJobs.find((j) => j._id === jobId) || null),
  );

export const getApplicants = (jobId) =>
  request(`/jobs/${jobId}/applicants`).catch(() =>
    Promise.resolve(mockApplicants.filter((a) => a.jobId === jobId)),
  );

export const getAllApplicants = () =>
  request("/applicants").catch(() => Promise.resolve(mockApplicants));

export const createApplicant = (jobId, applicantData) =>
  request(`/jobs/${jobId}/applicants`, {
    method: "POST",
    body: JSON.stringify(applicantData),
  });

export const updateApplicantStatus = (jobId, applicantId, status) =>
  request(`/jobs/${jobId}/applicants/${applicantId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const createJob = (jobData) =>
  request("/jobs", { method: "POST", body: JSON.stringify(jobData) });

export const updateJob = (jobId, jobData) =>
  request(`/jobs/${jobId}`, { method: "PUT", body: JSON.stringify(jobData) });

// Public endpoints — no auth required
export const getPublicJobs = () =>
  request("/public/jobs").catch(() =>
    Promise.resolve(mockJobs.filter((j) => j.isActive)),
  );

export const getPublicJobById = (jobId) =>
  request(`/public/jobs/${jobId}`).catch(() =>
    Promise.resolve(
      mockJobs.find((j) => j._id === jobId && j.isActive) || null,
    ),
  );

export const applyToJob = (jobId, applicantData) =>
  request(`/public/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify(applicantData),
  });

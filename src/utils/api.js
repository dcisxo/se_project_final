const BASE_URL = "/api";

const request = (endpoint, options = {}) => {
  const token = localStorage.getItem("jwt");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers }).then(
    (res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.message || `Server error: ${res.status}`);
        });
      }
      return res.json();
    }
  );
};

export const getCompanyData = (orgName) => request(`/github/${orgName}`);

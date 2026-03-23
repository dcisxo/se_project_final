const BASE_URL = "/auth";

const checkResponse = (res) => {
  if (!res.ok) {
    return res.json().then((data) => {
      throw new Error(data.message || `Server error: ${res.status}`);
    });
  }
  return res.json();
};

export const registerUser = (name, email, password) =>
  fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).then(checkResponse);

export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(checkResponse);

export const checkToken = (token) =>
  fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(checkResponse);

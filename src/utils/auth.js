// ---------------------------------------------------------------------------
// Stub helpers — simulate a backend so the app works without a running server.
// Users are persisted in localStorage under the USERS_KEY.
// Tokens are base64-encoded JSON payloads (not real JWTs, but sufficient for
// frontend-only simulation).
// ---------------------------------------------------------------------------

const USERS_KEY = "hirerank_users";

const _makeToken = (user) =>
  btoa(JSON.stringify({ sub: user._id, email: user.email }));

const _decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    throw new Error("Invalid token");
  }
};

const _getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

const _saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

const STUB_ACCESS_CODE = "HIRERANK-2026";

const _stubRegister = (name, email, password, accessCode) => {
  if (accessCode !== STUB_ACCESS_CODE) {
    return Promise.reject(new Error("Invalid organization access code"));
  }
  const users = _getUsers();
  if (users.find((u) => u.email === email)) {
    return Promise.reject(new Error("Email already in use"));
  }
  const user = { _id: `user_${Date.now()}`, name, email, password };
  _saveUsers([...users, user]);
  const { password: _pw, ...safeUser } = user;
  return Promise.resolve({ token: _makeToken(safeUser), user: safeUser });
};

const _stubLogin = (email, password) => {
  const users = _getUsers();
  const match = users.find((u) => u.email === email && u.password === password);
  if (!match) {
    return Promise.reject(new Error("Invalid email or password"));
  }
  const { password: _pw, ...safeUser } = match;
  return Promise.resolve({ token: _makeToken(safeUser), user: safeUser });
};

const _stubCheckToken = (token) => {
  const payload = _decodeToken(token);
  const users = _getUsers();
  const match = users.find((u) => u._id === payload.sub);
  if (!match) {
    return Promise.reject(new Error("User not found"));
  }
  const { password: _pw, ...safeUser } = match;
  return Promise.resolve({ user: safeUser });
};

// ---------------------------------------------------------------------------
// Public API — tries the real backend first; falls back to the stub when the
// server is unreachable (TypeError = network error / no server running).
// ---------------------------------------------------------------------------

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/auth` : "/auth";

const checkResponse = (res) => {
  if (!res.ok) {
    return res.json().then((data) => {
      throw new Error(data.message || `Server error: ${res.status}`);
    });
  }
  return res.json();
};

export const registerUser = (name, email, password, accessCode) =>
  fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, accessCode }),
  })
    .then(checkResponse)
    .catch((err) => {
      if (err instanceof TypeError) {
        // Server unreachable — use stub
        return _stubRegister(name, email, password, accessCode);
      }
      throw err;
    });

export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then(checkResponse)
    .catch((err) => {
      if (err instanceof TypeError) {
        return _stubLogin(email, password);
      }
      throw err;
    });

export const checkToken = (token) =>
  fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(checkResponse)
    .catch((err) => {
      if (err instanceof TypeError) {
        return _stubCheckToken(token);
      }
      throw err;
    });

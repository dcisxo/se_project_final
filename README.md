# HireRank

A full-stack applicant tracking system that lets hiring teams post jobs, review applicants, and score candidates using a built-in scoring engine backed by GitHub profile data.

## Tech Stack

**Frontend:** React 18, React Router v6, Vite  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth

## Features

- Organization-gated registration via access code
- JWT-based authentication (7-day tokens)
- Create, edit, and search job postings
- Public job board — no login required for applicants
- Applicant submission form with experience, skills, and GitHub username
- GitHub profile scoring engine (repos, contributions, languages)
- Applicant status management (pending → reviewed → accepted/rejected)
- Mock data fallback if the server is unreachable

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally on the default port (`27017`)

## Getting Started

### 1. Backend

```bash
cd server
npm install
npm run dev
```

The server starts on **port 5000** by default.

Create `server/.env` (or copy the example below):

```
MONGO_URI=mongodb://localhost:27017/hirerank
JWT_SECRET=<your-secret>
GITHUB_TOKEN=<your-github-personal-access-token>
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
ORG_ACCESS_CODE=HIRERANK-2026
```

### 2. Frontend

In a separate terminal, from the project root:

```bash
npm install
npm run dev
```

The app opens on **http://localhost:3000** (or the next available port).

## Registration

New accounts require the organization access code set in `ORG_ACCESS_CODE`. The default is `HIRERANK-2026`.

## Scripts

| Location | Command         | Description                |
| -------- | --------------- | -------------------------- |
| root     | `npm run dev`   | Start the Vite dev server  |
| root     | `npm run build` | Production build           |
| root     | `npm run lint`  | Run ESLint                 |
| server   | `npm run dev`   | Start backend with nodemon |
| server   | `npm start`     | Start backend (production) |

## Project Structure

```
se_project_final/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── contexts/         # AuthContext
│   ├── hooks/            # useAuth
│   └── utils/            # API helpers, auth stubs
└── server/               # Express backend
    ├── controllers/      # Route handlers
    ├── middleware/       # Auth, error handling
    ├── models/           # Mongoose schemas
    ├── routes/           # Express routers
    └── utils/            # GitHub API, scoring engine
```

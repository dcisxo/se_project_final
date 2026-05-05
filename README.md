# HireRank

A full-stack applicant tracking system that lets hiring teams post jobs, review applicants, and score candidates using a built-in scoring engine backed by GitHub profile data.

## Live Demo

**[http://34.58.5.203](http://34.58.5.203)** — Deployed on Google Cloud Compute Engine (Ubuntu 22.04, Node.js + MongoDB + Nginx + PM2)

## Deploying on Railway

The project is structured for two separate Railway services: one for the **frontend** (static Vite build) and one for the **backend** (Express API). A third Railway resource, the **MongoDB plugin**, is attached to the backend service.

### Step-by-step

#### 1. Create the backend service

1. In Railway, create a new project and add a **GitHub repo** service. Set the **Root Directory** to `server/`.
2. Add a **MongoDB** plugin to the project. Railway will automatically set `MONGO_URI` in the backend service via a reference variable.
3. Set the following environment variables on the backend service:

| Variable          | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| `MONGO_URI`       | `${{MongoDB.MONGO_URI}}` (Railway reference)                                 |
| `JWT_SECRET`      | Long random string                                                           |
| `GITHUB_TOKEN`    | GitHub Personal Access Token (optional — raises API limit to 5 000/hr)       |
| `ORG_ACCESS_CODE` | Registration access code, e.g. `HIRERANK-2026`                               |
| `CLIENT_ORIGIN`   | Frontend Railway URL once known — leave blank initially to allow all origins |

4. Deploy. Railway will run `npm install` then `node app.js`.

#### 2. Create the frontend service

1. Add another **GitHub repo** service to the same project, leave the root directory as `/` (project root).
2. Set the following environment variable **before** the first build:

| Variable            | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend Railway public URL, e.g. `https://yourapp-backend.up.railway.app` |

3. Deploy. Railway will run `npm install && npm run build` then `npm start` (`serve -s dist`).

> **Tip:** Use Railway's reference variables so services are linked automatically:  
> `VITE_API_BASE_URL = ${{backend-service-name.RAILWAY_PUBLIC_DOMAIN}}`  
> _(prefix with `https://`)_

#### 3. Finish wiring up

Once both services are live, set `CLIENT_ORIGIN` on the backend service to the frontend's Railway URL, then redeploy the backend.

## Project Pitch

- [**Here**!](https://drive.google.com/file/d/1mtm9UjZ9ZiR7C6knNc2Qwneitp9soFEX/view?usp=sharing)

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

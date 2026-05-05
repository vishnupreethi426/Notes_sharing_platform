# Note Sharing Platform

Full-stack notes app: **React (Vite)** frontend + **Node (Express)** API + **MongoDB Atlas** database.

## Run locally

Terminal 1 — API (`http://localhost:3001`):

```bash
cd server
npm install
npm start
```

Terminal 2 — web UI (`http://localhost:5173`):

```bash
npm install
npm run dev
```

Or both at once from project root: `npm run dev:all` (after `npm install` at root **and** in `server/`).

### Configuration
1. Copy `server/.env.example` to `server/.env`.
2. Set `JWT_SECRET` for authentication.
3. Set `MONGODB_URI` to your MongoDB Atlas connection string.

## Push to GitHub

Inside this folder (not your home directory):

```bash
git status
git remote add origin https://github.com/vishnupreethi426/Notes_sharing_platform.git
git push -u origin main
```

Use a Personal Access Token (HTTPS) or SSH if two-factor authentication is enabled.

## Deploy for judges / viva

You need **two deployments** unless you bundle static files with Express:

### 1) Backend (API + MongoDB)

- **Render**, **Railway**, or **Fly.io**: deploy the **`server`** directory as a **Node** service.
  - **Build:** `npm install`
  - **Start:** `npm start`
  - **Environment Variables:** 
    - `JWT_SECRET` (random long string)
    - `MONGODB_URI` (your MongoDB Atlas connection string)
    - Optionally `PORT` (platform often sets automatically)

Copy the **public URL** you get (e.g. `https://note-api.onrender.com`).

### 2) Frontend (static build)

- **Vercel** or **Netlify**: root = this repo.

  - **Build command:** `npm run build`
  - **Output directory:** `dist`
  - **Environment variable:**

    `VITE_API_BASE_URL` = full API prefix, **including** `/api`, e.g.  
    `https://note-api.onrender.com/api`

The app reads this at build time (`src/api/client.js`) so Axios calls your live API instead of `/api`.

**CORS:** The API enables `origin: true`; if the browser blocks requests, optionally set **`FRONTEND_URL`** later and tighten CORS in `server/index.js`.

---

Starter template ESLint/React notes apply to the scaffold; project-specific backend and pages are under `server/` and `src/`.

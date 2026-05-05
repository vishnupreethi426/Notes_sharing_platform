# Note Sharing Platform

Full-stack notes app: **React (Vite)** frontend + **Node (Express)** API + **SQLite** database (`server/data/*.sqlite` — ignored by Git; recreated on deploy).

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

Copy `server/.env.example` to `server/.env` and set `JWT_SECRET` for anything beyond local toy use.

Demo DB dump in terminal: from project root, `npm run demo:db`.

## Push to GitHub

Inside this folder (not your home directory):

```bash
git status
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Use a Personal Access Token (HTTPS) or SSH if two-factor authentication is enabled.

If the repo already has commits elsewhere, coordinate with `git pull --rebase` before pushing.

## Deploy for judges / viva

You need **two deployments** unless you bundle static files with Express:

### 1) Backend (API + SQLite)

- **Render**, **Railway**, or **Fly.io**: deploy the **`server`** directory as a **Node** service.
  - **Build:** `npm install`
  - **Start:** `npm start`
  - **Environment:** `JWT_SECRET` (random long string), optionally `PORT` (platform often sets automatically).
  - **SQLite caveat:** Free tiers usually have an **ephemeral disk** — data resets on restart. Enable a **persistent disk** on the provider, **or** use a hosted DB (PostgreSQL/MySQL/Turso) for a lasting demo account.

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

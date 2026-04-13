# Nutritional Insights — Diet Analysis Cloud Dashboard

**Live app:** [https://witty-pond-0e08a300f.6.azurestaticapps.net/](https://witty-pond-0e08a300f.6.azurestaticapps.net/)

Cloud-hosted dashboard (Phase 3): Azure Functions + Blob Storage for data processing and caching, Azure Static Web Apps for the React UI, and **Supabase Auth** (email/password + GitHub OAuth) so only signed-in users see the dashboard.

---

## Table of contents

- [Architecture](#architecture)
- [Features](#features)
- [Repository layout](#repository-layout)
- [Backend (Azure Functions)](#backend-azure-functions)
- [Frontend (React + Vite)](#frontend-react--vite)
- [Environment variables](#environment-variables)
- [Supabase configuration](#supabase-configuration)
- [Deployment](#deployment)
- [Local development](#local-development)
- [API reference](#api-reference)

---

## Architecture

| Layer | Service | Role |
|--------|---------|------|
| UI | **Azure Static Web Apps** | Hosts the built React SPA; CI/CD via GitHub Actions |
| API | **Azure Functions** (Python) | REST endpoints; blob trigger rebuilds cache when `All_Diets.csv` changes |
| Data | **Azure Blob Storage** | Raw CSV, cleaned CSV, and precomputed `dashboard_summary.json` cache |
| Auth | **Supabase** | Email/password + GitHub OAuth; optional `profiles` table in Postgres |

---

## Features

- **Performance (Phase 3):** Data cleaning and chart aggregation run when `datasets/All_Diets.csv` is updated (blob trigger). Results are stored in Blob (`cleaned/`, `cache/dashboard_summary.json`). The `dashboard-summary` HTTP endpoint reads the JSON cache instead of recomputing on every request.
- **Data interaction:** Diet-type filter, recipe keyword search (name/cuisine), and paginated recipe list via `/api/recipes`.
- **Security:** Login required for the dashboard; header shows user display name or email and **Logout**. Passwords are handled by Supabase Auth (hashed by the provider, not stored in app code).

---

## Repository layout

```text
backend/           # Azure Functions (Python)
frontend/          # React + TypeScript + Vite
.github/workflows/ # Static Web Apps CI/CD
```

---

## Backend (Azure Functions)

**Path:** `backend/`

**Stack:** Python, Azure Functions v2 programming model, pandas (via `shared/data_processor`).

**Important app settings (Azure Portal → Function App → Configuration):**

| Name | Purpose |
|------|---------|
| `AzureWebJobsStorage` | Required for Functions runtime and blob trigger |
| `AZURE_STORAGE_CONNECTION_STRING` | Used by `shared/blob_utils` to read/write blobs (if applicable) |
| `BLOB_CONTAINER_NAME` | Container name (e.g. `datasets` — align with your storage layout) |
| `BLOB_FILE_NAME` | Defaults to `All_Diets.csv` if unset |

**Blob layout (expected):**

- Trigger path: `datasets/All_Diets.csv`
- Outputs: `cleaned/cleaned_diets.csv`, `cache/dashboard_summary.json`

**Run locally:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
func start
```

Default local API base: `http://localhost:7071/api`

---

## Frontend (React + Vite)

**Path:** `frontend/`

**Stack:** React 19, TypeScript, Vite, Chart.js, Supabase JS client.

**Run locally:**

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` (not committed) — see [Environment variables](#environment-variables).

**Production build:**

```bash
npm run build
```

Output: `frontend/dist/`

---

## Environment variables

All client-side variables must be prefixed with `VITE_` so Vite exposes them at build time.

### Local file: `frontend/.env`

```env
# Azure Functions API base (no trailing slash required)
VITE_API_BASE_URL=http://localhost:7071/api

# Supabase (Project Settings → API)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

For production, **do not commit** real values. Use GitHub Actions secrets instead.

### GitHub Actions (Static Web Apps deploy)

Repository **Settings → Secrets and variables → Actions** — required secrets:

| Secret | Example / note |
|--------|----------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_*` | From Azure Portal → Static Web App → Manage deployment token |
| `VITE_API_BASE_URL` | `https://diet-chart-dashboard-318.azurewebsites.net/api` |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon public** key (never use `service_role` in the frontend) |

The workflow writes `frontend/.env.production` and runs `npm ci && npm run build` on the runner, then uploads `frontend/dist` with `skip_app_build: true`.

---

## Supabase configuration

1. **Project:** Create a project at [supabase.com](https://supabase.com).
2. **Auth → URL configuration**
   - **Site URL:** `https://witty-pond-0e08a300f.6.azurestaticapps.net` (and `http://localhost:5173` for local dev).
   - **Redirect URLs:** Add the same origins (and any path your OAuth flow uses).
3. **Auth → Providers:** Enable **Email**; enable **GitHub** (or another OAuth provider) and set the provider’s callback URL to Supabase’s callback (as shown in the dashboard).
4. **Database (optional rubric):** Create a `profiles` table linked to `auth.users` and/or a trigger to sync new users — credentials remain in Supabase Auth; profiles hold display metadata only.

---

## Deployment

### Frontend (already wired)

- Push to `main` triggers `.github/workflows/azure-static-web-apps-witty-pond-0e08a300f.yml`.
- **Live URL:** [https://witty-pond-0e08a300f.6.azurestaticapps.net/](https://witty-pond-0e08a300f.6.azurestaticapps.net/)

### Backend (Function App)

From the `backend` folder (Azure Functions Core Tools + `az login`):

```bash
func azure functionapp publish diet-chart-dashboard-318
```

Replace the app name if yours differs. Ensure **CORS** on the Function App allows your Static Web App origin if the browser calls the API cross-origin.

**Reference backend URL:** `https://diet-chart-dashboard-318.azurewebsites.net`

---

## Local development

1. Start **Azurite** or use a real storage account; configure `backend/local.settings.json` (not committed) with `AzureWebJobsStorage` and storage connection settings.
2. Run `func start` in `backend`.
3. Run `npm run dev` in `frontend` with `.env` pointing API and Supabase to local/dev values.
4. Sign in with a test user; open the dashboard and use **Get Nutritional Insights** / **Get Recipes**.

---

## API reference

Base URL: `{VITE_API_BASE_URL}` (e.g. `https://diet-chart-dashboard-318.azurewebsites.net/api`)

| Method | Route | Description |
|--------|--------|---------------|
| GET | `/dashboard-summary` | Returns cached chart summary JSON (`success`, `executionTimeMs`, chart payloads). The UI may append `?dietType=`; the current Python handler ignores that parameter and always returns the cached summary file. |
| GET | `/recipes` | Paginated recipes from cleaned CSV. Query: `page`, `pageSize`, optional `dietType`, optional `keyword` (matches recipe name / cuisine). |

Legacy Phase 2 endpoint `analyze-diets` is **not** used by the current frontend.

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| SWA shows “App failed to start” / missing Supabase | GitHub secrets `VITE_SUPABASE_*`; workflow run logs for `ci_check` lines |
| Charts request 404 on the SWA domain | `VITE_API_BASE_URL` must be the **Function App** URL ending in `/api`, not the Static Web App host |
| `dashboard-summary` 404 on Azure | Function App not published with current `backend` code; run `func azure functionapp publish ...` |
| `dashboard-summary` 500 | Blob missing `cache/dashboard_summary.json`; upload/replace `datasets/All_Diets.csv` to fire the blob trigger once |
| CORS errors | Add Static Web App URL to Function App CORS settings |

---

## License / course use

Built for an academic cloud computing project (Azure + serverless + static hosting + auth).

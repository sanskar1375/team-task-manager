# Team Task Manager

> Full-stack team task manager with role-based access control (Admin / Member), per-project Kanban boards, and a personal dashboard.

**Live URL:** _add your Railway URL here after deploying_
**Demo video:** _add your 2–5 min walkthrough link here_

---

## Features

- **Auth** — email + password signup / login, JWT (Bearer token), bcrypt password hashing, session persists across refreshes.
- **Projects** — create, edit, and delete projects. Project creator is auto-promoted to Admin.
- **Team management** — Admins invite existing users by email and assign Admin / Member roles.
- **Tasks** — full CRUD with title, description, assignee, priority, due date, status. Kanban board grouped by status (To Do / In Progress / Done).
- **RBAC** — strictly enforced server-side:
  - Members can create tasks and update the status of tasks assigned to them.
  - Admins can edit any task field, delete tasks, and manage project + team.
  - Non-members get `404`s, not `403`s, so they cannot enumerate projects.
- **Dashboard** — per-user view: status counts across all your projects, overdue tasks, your open assignments, and per-project progress bars.
- **UX polish** — loading skeletons, empty states, toast feedback, confirm dialogs on destructive actions, fully responsive (≥375px).

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, TailwindCSS, React Router v6, TanStack Query |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (HS256, 7-day expiry) + bcryptjs |
| Validation | Zod (shared schema patterns on every write endpoint) |
| Security | helmet, CORS, rate-limit on `/api/auth/*`, server-side RBAC |
| Deploy | Railway (single Node service + managed Postgres) |

## Demo credentials

After running the seed script (locally or in production):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.com` | `Demo1234!` |
| Member | `member@demo.com` | `Demo1234!` |

Both accounts share the seeded project **"Launch Q3 Website"** with 6 tasks across all statuses (one intentionally overdue).

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local install or Docker)

If you don't have Postgres locally, spin one up with Docker:

```bash
docker run --name ttm-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### 1. Install

```bash
git clone <your-repo-url>
cd "Full stack"

npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set `DATABASE_URL` + a long random `JWT_SECRET` (32+ chars).

Generate a secret quickly:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Migrate + seed

```bash
cd server
npx prisma migrate dev --name init
npm run seed
cd ..
```

### 4. Run dev servers

In two terminals:

```bash
# Terminal 1: API on :4000
npm --prefix server run dev

# Terminal 2: Web on :5173 (proxies /api to :4000)
npm --prefix client run dev
```

Open <http://localhost:5173> and log in with the demo credentials.

## API reference

All routes are prefixed with `/api`. All non-auth routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Body / Query |
| --- | --- | --- | --- |
| POST | `/auth/signup` | public | `{ name, email, password }` → `{ token, user }` |
| POST | `/auth/login` | public | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | required | → `{ user }` |

### Projects

| Method | Path | Auth | Role |
| --- | --- | --- | --- |
| POST | `/projects` | required | any (creator becomes Admin) |
| GET | `/projects` | required | any (lists user's projects) |
| GET | `/projects/:id` | required | Member |
| PATCH | `/projects/:id` | required | Admin |
| DELETE | `/projects/:id` | required | Admin |

### Members

| Method | Path | Auth | Role |
| --- | --- | --- | --- |
| GET | `/projects/:id/members` | required | Member |
| POST | `/projects/:id/members` | required | Admin (`{ email, role }`) |
| PATCH | `/projects/:id/members/:userId` | required | Admin (`{ role }`) |
| DELETE | `/projects/:id/members/:userId` | required | Admin |

### Tasks

| Method | Path | Auth | Role |
| --- | --- | --- | --- |
| POST | `/projects/:id/tasks` | required | Member |
| GET | `/projects/:id/tasks?status=&assigneeId=&overdue=` | required | Member |
| GET | `/tasks/:id` | required | Member of parent project |
| PATCH | `/tasks/:id` | required | Admin (any field); assignee (status only) |
| DELETE | `/tasks/:id` | required | Admin |

### Dashboard

| Method | Path | Auth | Returns |
| --- | --- | --- | --- |
| GET | `/dashboard/me` | required | `{ myTasks, statusCounts, overdue, projectsProgress }` |

### Error shape

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request", "details": [...] } }
```

Common codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500).

## Folder structure

```
Full stack/
├── server/                        Express + Prisma API
│   ├── src/
│   │   ├── app.ts                 builds the Express app
│   │   ├── index.ts               entrypoint (listen + graceful shutdown)
│   │   ├── prisma.ts              PrismaClient singleton
│   │   ├── lib/                   env, hash, jwt, errors
│   │   ├── middleware/            requireAuth, requireProjectRole, errorHandler, notFound
│   │   ├── schemas/               Zod validation schemas
│   │   └── routes/                auth, projects, tasks, dashboard
│   └── prisma/
│       ├── schema.prisma          data model
│       ├── migrations/            generated SQL migrations
│       └── seed.ts                demo data
├── client/                        React + Vite + Tailwind frontend
│   └── src/
│       ├── main.tsx               app entrypoint
│       ├── App.tsx                routes + 401 handler
│       ├── lib/                   api wrapper, auth context, toast, query client
│       ├── components/            Layout, Modal, Field, Badge, TaskCard, TaskModal, ...
│       ├── pages/                 Login, Signup, Dashboard, Projects, ProjectDetail, NotFound
│       └── types/                 API response shapes
├── railway.json                   single-service Railway deploy config
├── package.json                   root scripts (dev / build / start / seed)
└── README.md
```

## Deployment — Railway

This project is designed as a **single Railway service**. Express serves the built React app from `client/dist` and exposes the API under `/api/*`.

### One-time setup

1. **Push to GitHub.**

   ```bash
   git init
   git add .
   git commit -m "feat: initial Team Task Manager"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a Railway project from the repo.** In Railway: _New Project → Deploy from GitHub repo_, then pick this repo.

3. **Add Postgres.** In the same project: _New → Database → Add PostgreSQL_. Railway will automatically inject `DATABASE_URL` into the service.

4. **Set environment variables** on the service:
   - `JWT_SECRET` — generate a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` — set to your Railway-provided URL (e.g. `https://your-app.up.railway.app`) after the first deploy
   - `DATABASE_URL` — already wired by the Postgres plugin

5. **Deploy.** Railway picks up `railway.json` and runs the configured build + start commands. Prisma migrations apply automatically on startup via `prisma migrate deploy`.

6. **Seed the production database.** Once the service is up, open the Railway shell for the service and run:

   ```bash
   npm --prefix server run seed
   ```

7. **Smoke test.** Open the public URL, sign in with `admin@demo.com / Demo1234!`, walk through the full Kanban + dashboard + RBAC flow.

### Build / start commands (already in `railway.json`)

```
build:  npm --prefix client ci && npm --prefix client run build \
     && npm --prefix server ci && npm --prefix server run build \
     && npx --prefix server prisma generate

start:  npx --prefix server prisma migrate deploy \
     && node server/dist/index.js
```

## Demo video

A 2–5 minute walkthrough covers:

1. Sign up as a new user → land on empty dashboard.
2. Log in as Admin → populated dashboard.
3. Open project, walk the Kanban, move a task `TODO → IN_PROGRESS → DONE`.
4. Open Manage Team, add a member by email.
5. Log out, log in as Member.
6. Member can change their assigned task's status.
7. Member cannot delete the project (403 toast).
8. Dashboard reflects updated counts and overdue.

> _Add the video link at the top of this README once recorded._

## License

MIT.

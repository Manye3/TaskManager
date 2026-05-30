# TaskFlow

A task management app with a Kanban-style board. Built with React + Express + SQLite.

![image](https://img.shields.io/badge/react-19-blue) ![image](https://img.shields.io/badge/express-4-green) ![image](https://img.shields.io/badge/sqlite-3-orange)

## What it does

- Register / login with JWT auth
- Create tasks with title, description, priority (low/medium/high) 
- Move tasks between stages: **Todo → In Progress → Done**
- Edit or delete tasks
- Everything persists in a SQLite database

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, React Router, React Hot Toast |
| Backend | Node.js, Express, better-sqlite3 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Vanilla CSS (dark theme, glassmorphism) |

### Why these choices?

- **SQLite** over Postgres/Mongo — no external database to set up, everything runs from a single file. For a task manager at this scale it's more than enough.
- **Vanilla CSS** — wanted full control over the design without a utility framework. Easier to keep consistent with custom properties.
- **Vite** — fast HMR, simple config, just works.
- **JWT** — stateless auth that works well with SPAs. Token stored in localStorage with 7-day expiry.

## Project Structure

```
taskflow/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # TaskCard, TaskModal, ProtectedRoute
│   │   ├── context/       # AuthContext (login state)
│   │   ├── pages/         # Login, Register, Dashboard
│   │   ├── utils/         # API fetch wrapper
│   │   ├── App.jsx
│   │   └── index.css      # All styles
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── routes/        # auth.js, tasks.js
│   │   ├── db.js          # SQLite setup
│   │   └── index.js       # Server entry
│   ├── .env
│   └── package.json
│
└── README.md
```

## Running Locally

You'll need Node.js 18+ installed.

**1. Start the backend**

```bash
cd server
npm install
npm run dev
```

Server starts on `http://localhost:5000`. On first run it creates the SQLite database file automatically.

**2. Start the frontend**

```bash
cd client
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

## API Endpoints

All task endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (name, email, password) |
| POST | `/api/auth/login` | Login (email, password) |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tasks` | List all tasks (optional `?stage=` filter) |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Assumptions & Tradeoffs

- **No refresh tokens** — kept it simple with a single JWT that expires in 7 days. For a production app I'd add refresh token rotation.
- **No drag-and-drop** — went with arrow buttons to move tasks between stages instead. Simpler to implement and still intuitive. Could add dnd later with something like `@dnd-kit`.
- **SQLite in dev** — works great for a single-server setup. If this needed to scale horizontally, I'd swap to Postgres.
- **No email verification** — skipped for scope. Would add in production with something like Resend or SendGrid.
- **localStorage for tokens** — simpler than httpOnly cookies for a SPA. In production I'd consider cookies to avoid XSS exposure.
- **CORS is open** — `cors()` allows all origins in dev. For production, I'd lock it down to the deployed frontend URL.

## Deployment

- **Frontend**: Deployed on Vercel / Netlify (set `VITE_API_URL` env var to your backend URL)
- **Backend**: Can be deployed on Render, Railway, or Fly.io (set `JWT_SECRET` and `PORT` env vars)

For Vercel deployment of the frontend, make sure to set the root directory to `client/`.

## License

MIT

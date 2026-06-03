# Quiz App

Full-stack quiz application — take quizzes on AI agent concepts, track your attempts, and view your dashboard stats.

## Architecture

```
fullstack-interview/
├── client/          # React + Vite frontend
├── server/          # Express + SQLite backend (sql.js)
└── package.json     # npm workspaces root
```

The server runs on **port 3001**, the client dev server on **5173** (Vite default). They communicate via a thin REST API — no BFF, no GraphQL.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite |
| State | Redux Toolkit (RTK) |
| Routing | React Router v7 |
| Backend | Express 4, TypeScript, ts-node-dev |
| Database | SQLite via sql.js (in-process, file-persisted) |
| Workspaces | npm workspaces |
| Formatting | Prettier |

## Quick Start

```bash
# Install all dependencies (root + client + server)
npm install

# Seed the database with quiz data
npm run seed

# Start the server (port 3001)
npm run dev
```

In a separate terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` and start quizzing.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the server in dev mode (auto-restart) |
| `npm run build` | Compile the server to `dist/` |
| `npm run seed` | Seed the database with quiz content |
| `npm run lint` | Lint all workspaces |
| `npm run format` | Check formatting with Prettier |
| `npm run format:fix` | Auto-fix formatting issues |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/quizzes` | List all quizzes |
| GET | `/api/quizzes/:id` | Get quiz with questions |
| POST | `/api/quizzes/:id/submit` | Submit answers to a quiz |
| GET | `/api/attempts/:id` | Get attempt details |
| POST | `/api/users` | Find or create a user |
| GET | `/api/users/:username/stats` | Get user dashboard stats |
| GET | `/api/users/:username/attempts` | Get user attempt history |

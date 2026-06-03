# Quiz App — Server

Express + TypeScript backend with an embedded SQLite database (sql.js). In-process, zero external DB process required.

## Architecture

The server follows a **layered architecture** with explicit dependency injection at startup:

```
routes  →  controllers  →  services  →  repositories  →  sql.js DB
```

```
src/
├── index.ts               # App entry: wires deps, mounts routes, starts server
├── types.ts               # Shared domain types
├── sql.js.ts              # sql.js WASM initialization helper
├── routes/                # Express Router definitions (thin, controller-only)
│   ├── quizRoutes.ts
│   ├── attemptRoutes.ts
│   └── userRoutes.ts
├── controllers/           # Request parsing, response shaping, error mapping
│   ├── quizController.ts
│   ├── attemptController.ts
│   └── userController.ts
├── services/              # Business logic, orchestration
│   ├── quizCatalogService.ts
│   ├── quizTakingService.ts
│   ├── quizResultsService.ts
│   ├── userService.ts
│   └── dashboardService.ts
├── repositories/          # Data access layer (interfaces + implementations)
│   ├── interfaces.ts      # Repository interfaces (depends on nothing)
│   ├── wiring.ts          # Factory that wires repos to concrete SQLite impls
│   └── sqlite/            # SQLite repository implementations
└── db/                    # Database setup
    ├── connection.ts      # sql.js init, file persistence, schema migration
    ├── schema.ts          # DDL (CREATE TABLE statements)
    └── seed.ts            # Seed data: AI agent quizzes
```

### Dependency Flow

```
                    ┌─────────────┐
                    │   routes    │
                    └──────┬──────┘
                           │ inject controllers
                    ┌──────▼──────┐
                    │ controllers │
                    └──────┬──────┘
                           │ inject services
                    ┌──────▼──────┐
                    │  services   │
                    └──────┬──────┘
                           │ inject repositories (via interfaces)
                    ┌──────▼──────┐
                    │ repositories│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   sql.js DB │
                    └─────────────┘
```

All wiring happens in `src/index.ts`. Nothing uses static singletons or service locators — dependencies are explicit and testable.

## Getting Started

```bash
# Install dependencies (from root)
npm install

# Seed the database
npm run seed

# Start in dev mode (auto-restart on changes)
npm run dev
```

The server listens on `http://localhost:3001`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with ts-node-dev (auto-restart) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled JS from `dist/` |
| `npm run seed` | Seed the database with quiz content |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Auto-fix lint issues |

## API Endpoints

All endpoints are prefixed with `/api`.

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Returns `{ status: "ok", timestamp }` |

### Quizzes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quizzes` | List all quizzes (catalog, no questions) |
| GET | `/api/quizzes/:id` | Get quiz with all questions |

### Attempts

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/quizzes/:id/submit` | Submit answers and receive score |
| GET | `/api/attempts/:id` | Get attempt details by ID |

### Users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Find or create a user by username |
| GET | `/api/users/:username/stats` | Dashboard stats (avg score, attempts, quizzes completed) |
| GET | `/api/users/:username/attempts` | User attempt history |

## Database

The server uses **sql.js** — SQLite compiled to WebAssembly, running in-process. The database file is persisted to `server/data/quiz-app.db`.

- Schema is auto-created on first startup (`db/schema.ts`)
- A `PRAGMA foreign_keys = ON` is set at connection time
- The DB is saved to disk after every write operation via `persistDb()`

### Seed Data

Run `npm run seed` to populate the database with AI agent-themed quizzes. The seed script calls `persistDb()` when done, so the data survives restarts.

# Quiz App — Client

React + TypeScript frontend for the quiz application, bootstrapped with Vite.

## Tech

| Concern | Choice |
|---------|--------|
| UI Library | React 18 |
| Language | TypeScript (strict mode) |
| Bundler | Vite 6 |
| State Management | Redux Toolkit |
| Routing | React Router v7 |
| HTTP | Native `fetch` (no axios) |
| Linting | ESLint + Prettier |

## Getting Started

```bash
# Install dependencies (from root)
npm install

# Start the dev server (port 5173)
cd client && npm run dev
```

The dev server proxies API calls to `http://localhost:3001/api`. Make sure the server is running.

## Project Structure

```
src/
├── api/
│   └── client.ts          # Native fetch wrapper, typed helpers (get/post)
├── components/            # Reusable UI components
├── pages/                 # Route-level page components
├── store/
│   ├── index.ts           # Redux store config + typed hooks
│   ├── quizSlice.ts       # Quiz catalog & current quiz state
│   ├── scoreSlice.ts      # Attempt results & score state
│   └── uiSlice.ts         # View navigation & UI state
└── types.ts               # Shared domain types (Quiz, Attempt, User, etc.)
```

### State Slices

The store has three slices at `store/`:

- **quiz** — quizzes catalog, currently playing quiz, loading states
- **score** — latest attempt result, score history
- **ui** — current view (`catalog`, `playing`, `results`, `dashboard`)

Typed hooks `useAppDispatch` and `useAppSelector` are exported from `store/index.ts` — use them instead of raw `useDispatch`/`useSelector`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Auto-fix lint issues |

## API Client

The API layer lives in `src/api/client.ts`. It wraps `fetch` with typed helpers:

```typescript
import { get, post } from '../api/client';

// Typed responses
const quizzes = await get<Quiz[]>('/quizzes');
const result = await post<AttemptResult>('/quizzes/:id/submit', { answers });
```

Error classes `ClientError` (4xx) and `ServerError` (5xx) extend a base `ApiError`.

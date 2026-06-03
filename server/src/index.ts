import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getDb } from './db/connection';
import { createRepositories } from './repositories/wiring';

import { QuizCatalogService } from './services/quizCatalogService';
import { QuizTakingService } from './services/quizTakingService';
import { QuizResultsService } from './services/quizResultsService';
import { UserService } from './services/userService';
import { DashboardService } from './services/dashboardService';

import { QuizController } from './controllers/quizController';
import { AttemptController } from './controllers/attemptController';
import { UserController } from './controllers/userController';

import { createQuizRouter } from './routes/quizRoutes';
import { createAttemptRouter } from './routes/attemptRoutes';
import { createUserRouter } from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Global error handler (must come last)
// ---------------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Startup — wire dependencies then mount routes
// ---------------------------------------------------------------------------
async function start(): Promise<void> {
  // Initialize database
  const db = await getDb();
  console.log('Database initialized');

  // Wire repositories
  const repos = createRepositories(db);

  // Wire services
  const quizCatalogService = new QuizCatalogService(repos.quizRepo);
  const quizTakingService = new QuizTakingService(repos.quizRepo);
  const quizResultsService = new QuizResultsService(repos.attemptRepo, repos.quizRepo);
  const userService = new UserService(repos.userRepo);
  const dashboardService = new DashboardService(repos.dashboardRepo);

  // Wire controllers
  const quizController = new QuizController(quizCatalogService, quizTakingService);
  const attemptController = new AttemptController(quizResultsService);
  const userController = new UserController(userService, dashboardService);

  // Wire routes — inject controllers into routers
  const quizRouter = createQuizRouter(quizController);
  const attemptRouter = createAttemptRouter(attemptController);
  const userRouter = createUserRouter(userController);

  // Mount routes
  app.use('/api/quizzes', quizRouter);
  app.use('/api', attemptRouter);
  app.use('/api/users', userRouter);

  app.listen(PORT, () => {
    console.log(`Quiz App server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;

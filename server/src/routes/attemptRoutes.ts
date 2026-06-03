import { Router } from 'express';
import { AttemptController } from '../controllers/attemptController';

export function createAttemptRouter(attemptController: AttemptController): Router {
  const router = Router();

  // Mounted at /api — these define full sub-paths
  router.post('/quizzes/:id/submit', attemptController.handleSubmitQuiz);
  router.get('/attempts/:id', attemptController.handleGetAttempt);

  return router;
}

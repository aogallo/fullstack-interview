import { Router } from 'express';
import { QuizController } from '../controllers/quizController';

export function createQuizRouter(quizController: QuizController): Router {
  const router = Router();

  router.get('/', quizController.handleGetQuizzes);
  router.get('/:id', quizController.handleGetQuizById);

  return router;
}

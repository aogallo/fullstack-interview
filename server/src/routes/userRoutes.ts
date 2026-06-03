import { Router } from 'express';
import { UserController } from '../controllers/userController';

export function createUserRouter(userController: UserController): Router {
  const router = Router();

  router.post('/', userController.handleFindOrCreateUser);
  router.get('/:username/stats', userController.handleGetDashboard);
  router.get('/:username/attempts', userController.handleGetAttemptHistory);

  return router;
}

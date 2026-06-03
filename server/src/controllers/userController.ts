import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { DashboardService } from '../services/dashboardService';

export class UserController {
  constructor(
    private userService: UserService,
    private dashboardService: DashboardService,
  ) {}

  handleFindOrCreateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        res.status(400).json({ error: 'username is required' });
        return;
      }

      const user = await this.userService.findOrCreate(username.trim());
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleGetDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const username = String(req.params.username);
      const stats = await this.dashboardService.getStats(username);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  handleGetAttemptHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const username = String(req.params.username);
      const attempts = await this.dashboardService.getAttemptHistory(username);
      res.json(attempts);
    } catch (err) {
      next(err);
    }
  };
}

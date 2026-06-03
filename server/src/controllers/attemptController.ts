import { Request, Response, NextFunction } from 'express';
import { QuizResultsService } from '../services/quizResultsService';

export class AttemptController {
  constructor(private resultsService: QuizResultsService) {}

  handleSubmitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizId = String(req.params.id);
      const { username, answers } = req.body;

      if (!username || !answers || typeof answers !== 'object') {
        res.status(400).json({ error: 'username and answers are required' });
        return;
      }

      const attempt = await this.resultsService.createAttempt(quizId, username, answers);

      const total = attempt.total;
      const percentage = total > 0 ? Math.round((attempt.score / total) * 100) : 0;

      let performance: string;
      if (percentage >= 80) {
        performance = 'Excellent';
      } else if (percentage >= 50) {
        performance = 'Keep practicing';
      } else {
        performance = 'Needs review';
      }

      res.status(201).json({ ...attempt, percentage, performance });
    } catch (err) {
      next(err);
    }
  };

  handleGetAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid attempt ID' });
        return;
      }

      const attempt = await this.resultsService.findById(id);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      const total = attempt.total;
      const percentage = total > 0 ? Math.round((attempt.score / total) * 100) : 0;

      let performance: string;
      if (percentage >= 80) {
        performance = 'Excellent';
      } else if (percentage >= 50) {
        performance = 'Keep practicing';
      } else {
        performance = 'Needs review';
      }

      res.json({ ...attempt, percentage, performance });
    } catch (err) {
      next(err);
    }
  };
}

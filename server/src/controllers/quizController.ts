import { Request, Response, NextFunction } from 'express';
import { QuizCatalogService } from '../services/quizCatalogService';
import { QuizTakingService } from '../services/quizTakingService';

export class QuizController {
  constructor(
    private catalogService: QuizCatalogService,
    private takingService: QuizTakingService,
  ) {}

  handleGetQuizzes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzes = await this.catalogService.findAll();
      res.json(quizzes);
    } catch (err) {
      next(err);
    }
  };

  handleGetQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quiz = await this.takingService.findWithQuestions(String(req.params.id));
      if (!quiz) {
        res.status(404).json({ error: 'Quiz not found' });
        return;
      }
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  };
}

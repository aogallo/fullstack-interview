import { Quiz } from '../types';
import { IQuizRepository } from '../repositories/interfaces';

export class QuizTakingService {
  constructor(private quizRepo: IQuizRepository) {}

  async findWithQuestions(id: string): Promise<Quiz | null> {
    const quiz = await this.quizRepo.findById(id);
    if (!quiz) return null;

    const questions = await this.quizRepo.findQuestions(id);
    return { ...quiz, questions };
  }
}

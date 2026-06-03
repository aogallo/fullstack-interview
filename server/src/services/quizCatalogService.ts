import { Quiz } from '../types';
import { IQuizRepository } from '../repositories/interfaces';

export class QuizCatalogService {
  constructor(private quizRepo: IQuizRepository) {}

  async findAll(): Promise<Quiz[]> {
    return this.quizRepo.findAll();
  }
}

import { Attempt } from '../types';
import { IAttemptRepository, IQuizRepository } from '../repositories/interfaces';

export class QuizResultsService {
  constructor(
    private attemptRepo: IAttemptRepository,
    private quizRepo: IQuizRepository,
  ) {}

  async createAttempt(
    quizId: string,
    username: string,
    answers: Record<number, number>,
  ): Promise<Attempt> {
    const questions = await this.quizRepo.findQuestions(quizId);
    const total = questions.length;

    // Calculate score: each correct answer = 1 point
    let score = 0;
    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score++;
      }
    }

    return this.attemptRepo.create({
      quizId,
      username,
      answers,
      score,
      total,
    });
  }

  async findById(id: number): Promise<Attempt | null> {
    return this.attemptRepo.findById(id);
  }
}

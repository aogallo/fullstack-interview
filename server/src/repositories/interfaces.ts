import { Quiz, Question, Attempt, User, UserStats } from '../types';

export interface IQuizRepository {
  findAll(): Promise<Quiz[]>;
  findById(id: string): Promise<Quiz | null>;
  findQuestions(quizId: string): Promise<Question[]>;
}

export interface IAttemptRepository {
  create(attempt: Omit<Attempt, 'id' | 'createdAt'>): Promise<Attempt>;
  findById(id: number): Promise<Attempt | null>;
  findByUsername(username: string): Promise<Attempt[]>;
}

export interface IUserRepository {
  findOrCreate(username: string): Promise<User>;
  findByUsername(username: string): Promise<User | null>;
}

export interface IUserDashboardRepository {
  getStats(username: string): Promise<UserStats>;
  getAttemptHistory(username: string): Promise<Attempt[]>;
}

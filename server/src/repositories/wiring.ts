import { Database } from 'sql.js';
import {
  SqliteQuizRepository,
  SqliteAttemptRepository,
  SqliteUserRepository,
  SqliteUserDashboardRepository,
} from './sqlite';
import {
  IQuizRepository,
  IAttemptRepository,
  IUserRepository,
  IUserDashboardRepository,
} from './interfaces';

export interface Repositories {
  quizRepo: IQuizRepository;
  attemptRepo: IAttemptRepository;
  userRepo: IUserRepository;
  dashboardRepo: IUserDashboardRepository;
}

export function createRepositories(db: Database): Repositories {
  return {
    quizRepo: new SqliteQuizRepository(db),
    attemptRepo: new SqliteAttemptRepository(db),
    userRepo: new SqliteUserRepository(db),
    dashboardRepo: new SqliteUserDashboardRepository(db),
  };
}

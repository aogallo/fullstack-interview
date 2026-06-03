// ---------------------------------------------------------------------------
// Domain types — mirror server/src/types.ts
// ---------------------------------------------------------------------------

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

/**
 * A quiz fetched by ID always has questions populated.
 * Semantically distinct from a quiz in the catalog listing.
 */
export type QuizDetail = Quiz;

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Attempt {
  id: number;
  quizId: string;
  username: string | null;
  answers: Record<number, number>;
  score: number;
  total: number;
  createdAt: string;
}

/** Attempt returned from submit / fetch includes computed fields. */
export interface AttemptResult extends Attempt {
  percentage: number;
  performance: string;
}

export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface UserStats {
  username: string;
  totalAttempts: number;
  averageScore: number;
  quizzesCompleted: number;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

// ---------------------------------------------------------------------------
// UI view states
// ---------------------------------------------------------------------------

export type AppView = 'catalog' | 'playing' | 'results' | 'dashboard';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

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

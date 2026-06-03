import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizResultsService } from '../quizResultsService';
import { UserService } from '../userService';
import { DashboardService } from '../dashboardService';
import type { IAttemptRepository, IQuizRepository, IUserRepository, IUserDashboardRepository } from '../../repositories/interfaces';
import type { Question, Attempt, User, UserStats } from '../../types';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockQuizRepo(questions: Question[]): IQuizRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findQuestions: vi.fn().mockResolvedValue(questions),
  };
}

function createMockAttemptRepo(existingAttempt: Attempt | null = null): IAttemptRepository {
  return {
    create: vi.fn().mockImplementation(
      (data: Omit<Attempt, 'id' | 'createdAt'>) =>
        Promise.resolve({
          ...data,
          id: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
        } as Attempt),
    ),
    findById: vi.fn().mockResolvedValue(existingAttempt),
    findByUsername: vi.fn().mockResolvedValue([]),
  };
}

function createMockUserRepo(existingUser: User | null = null): IUserRepository {
  return {
    findOrCreate: vi.fn().mockImplementation((username: string) =>
      Promise.resolve(
        existingUser ?? {
          id: 1,
          username,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ),
    ),
    findByUsername: vi.fn().mockResolvedValue(existingUser),
  };
}

function createMockDashboardRepo(stats: UserStats | null = null): IUserDashboardRepository {
  return {
    getStats: vi.fn().mockResolvedValue(
      stats ?? {
        username: 'test',
        totalAttempts: 0,
        averageScore: 0,
        quizzesCompleted: 0,
      },
    ),
    getAttemptHistory: vi.fn().mockResolvedValue([]),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('QuizResultsService', () => {
  let mockAttemptRepo: IAttemptRepository;
  let mockQuizRepo: IQuizRepository;
  let service: QuizResultsService;

  const sampleQuestions: Question[] = [
    { id: 1, question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'E1' },
    { id: 2, question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 2, explanation: 'E2' },
    { id: 3, question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswer: 1, explanation: 'E3' },
  ];

  beforeEach(() => {
    mockAttemptRepo = createMockAttemptRepo();
    mockQuizRepo = createMockQuizRepo(sampleQuestions);
    service = new QuizResultsService(mockAttemptRepo, mockQuizRepo);
  });

  describe('createAttempt', () => {
    it('calculates score correctly for all correct answers', async () => {
      const result = await service.createAttempt('quiz-1', 'alice', {
        1: 0,
        2: 2,
        3: 1,
      });

      expect(result.score).toBe(3);
      expect(result.total).toBe(3);
    });

    it('calculates score correctly for some wrong answers', async () => {
      const result = await service.createAttempt('quiz-1', 'bob', {
        1: 0, // correct
        2: 0, // wrong (correct is 2)
        3: 1, // correct
      });

      expect(result.score).toBe(2);
      expect(result.total).toBe(3);
    });

    it('calculates score correctly for all wrong answers', async () => {
      const result = await service.createAttempt('quiz-1', 'eve', {
        1: 1,
        2: 0,
        3: 0,
      });

      expect(result.score).toBe(0);
      expect(result.total).toBe(3);
    });

    it('handles empty answers object (no questions answered)', async () => {
      const result = await service.createAttempt('quiz-1', 'empty', {});
      expect(result.score).toBe(0);
      expect(result.total).toBe(3);
    });

    it('handles quiz with no questions', async () => {
      mockQuizRepo = createMockQuizRepo([]);
      service = new QuizResultsService(mockAttemptRepo, mockQuizRepo);

      const result = await service.createAttempt('empty-quiz', 'alice', {});
      expect(result.score).toBe(0);
      expect(result.total).toBe(0);
    });

    it('calls attemptRepo.create with correct data', async () => {
      await service.createAttempt('quiz-1', 'alice', { 1: 0, 2: 2, 3: 1 });

      expect(mockAttemptRepo.create).toHaveBeenCalledWith({
        quizId: 'quiz-1',
        username: 'alice',
        answers: { 1: 0, 2: 2, 3: 1 },
        score: 3,
        total: 3,
      });
    });
  });

  describe('findById', () => {
    it('returns attempt when found', async () => {
      mockAttemptRepo = createMockAttemptRepo({
        id: 1,
        quizId: 'q1',
        username: 'alice',
        answers: { 1: 0 },
        score: 1,
        total: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
      service = new QuizResultsService(mockAttemptRepo, mockQuizRepo);

      const result = await service.findById(1);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
    });

    it('returns null when not found', async () => {
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });
});

describe('UserService', () => {
  let mockUserRepo: IUserRepository;
  let service: UserService;

  beforeEach(() => {
    mockUserRepo = createMockUserRepo();
    service = new UserService(mockUserRepo);
  });

  describe('findOrCreate', () => {
    it('creates a new user', async () => {
      const user = await service.findOrCreate('newuser');
      expect(user.username).toBe('newuser');
      expect(mockUserRepo.findOrCreate).toHaveBeenCalledWith('newuser');
    });

    it('returns existing user', async () => {
      const existing: User = {
        id: 5,
        username: 'existing',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      mockUserRepo = createMockUserRepo(existing);
      service = new UserService(mockUserRepo);

      const user = await service.findOrCreate('existing');
      expect(user.id).toBe(5);
    });
  });
});

describe('DashboardService', () => {
  let mockDashboardRepo: IUserDashboardRepository;
  let service: DashboardService;

  beforeEach(() => {
    mockDashboardRepo = createMockDashboardRepo();
    service = new DashboardService(mockDashboardRepo);
  });

  describe('getStats', () => {
    it('returns stats from repository', async () => {
      const mockStats: UserStats = {
        username: 'alice',
        totalAttempts: 5,
        averageScore: 85,
        quizzesCompleted: 3,
      };
      mockDashboardRepo = createMockDashboardRepo(mockStats);
      service = new DashboardService(mockDashboardRepo);

      const stats = await service.getStats('alice');
      expect(stats.totalAttempts).toBe(5);
      expect(stats.averageScore).toBe(85);
      expect(stats.quizzesCompleted).toBe(3);
    });

    it('returns zero stats for new user', async () => {
      const stats = await service.getStats('newbie');
      expect(stats.totalAttempts).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.quizzesCompleted).toBe(0);
    });
  });

  describe('getAttemptHistory', () => {
    it('returns empty array for new user', async () => {
      const history = await service.getAttemptHistory('newbie');
      expect(history).toEqual([]);
    });
  });
});

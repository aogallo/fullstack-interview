import { describe, it, expect, beforeEach } from 'vitest';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { SCHEMA_SQL } from '../../../db/schema';
import {
  SqliteQuizRepository,
  SqliteAttemptRepository,
  SqliteUserRepository,
  SqliteUserDashboardRepository,
} from '../index';

// ---------------------------------------------------------------------------
// In-memory SQLite helpers
// ---------------------------------------------------------------------------

let SQL: SqlJsStatic;

async function createDb(): Promise<Database> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);
  return db;
}

function seedQuiz(db: Database, id: string, title: string, description: string): void {
  db.run('INSERT INTO quizzes (id, title, description) VALUES (?, ?, ?)', [
    id,
    title,
    description,
  ]);
}

function seedQuestion(
  db: Database,
  id: number,
  quizId: string,
  question: string,
  options: string[],
  correctAnswer: number,
  explanation: string,
): void {
  db.run(
    'INSERT INTO questions (id, quiz_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?)',
    [id, quizId, question, JSON.stringify(options), correctAnswer, explanation],
  );
}

function seedAttempt(
  db: Database,
  quizId: string,
  username: string,
  answers: Record<number, number>,
  score: number,
  total: number,
): void {
  db.run(
    "INSERT INTO attempts (quiz_id, username, answers, score, total) VALUES (?, ?, ?, ?, ?)",
    [quizId, username, JSON.stringify(answers), score, total],
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SqliteQuizRepository', () => {
  let db: Database;
  let repo: SqliteQuizRepository;

  beforeEach(async () => {
    db = await createDb();
    repo = new SqliteQuizRepository(db);
  });

  describe('findAll', () => {
    it('returns empty array when no quizzes exist', async () => {
      const result = await repo.findAll();
      expect(result).toEqual([]);
    });

    it('returns all quizzes sorted by title', async () => {
      seedQuiz(db, 'b-quiz', 'B Quiz', 'Second');
      seedQuiz(db, 'a-quiz', 'A Quiz', 'First');

      const result = await repo.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('A Quiz');
      expect(result[1].title).toBe('B Quiz');
    });

    it('returns quizzes without questions', async () => {
      seedQuiz(db, 'test-1', 'Test Quiz', 'A test quiz');
      const result = await repo.findAll();
      expect(result[0]).toEqual({
        id: 'test-1',
        title: 'Test Quiz',
        description: 'A test quiz',
        questions: [],
      });
    });
  });

  describe('findById', () => {
    it('returns null for non-existent quiz', async () => {
      const result = await repo.findById('non-existent');
      expect(result).toBeNull();
    });

    it('returns the quiz when found', async () => {
      seedQuiz(db, 'test-1', 'Test Quiz', 'A test quiz');
      const result = await repo.findById('test-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('test-1');
      expect(result!.title).toBe('Test Quiz');
    });
  });

  describe('findQuestions', () => {
    it('returns empty array for quiz with no questions', async () => {
      seedQuiz(db, 'test-1', 'Test Quiz', 'Desc');
      const result = await repo.findQuestions('test-1');
      expect(result).toEqual([]);
    });

    it('returns questions ordered by id', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      seedQuestion(db, 2, 'q1', 'Second?', ['A', 'B'], 0, 'Nope');
      seedQuestion(db, 1, 'q1', 'First?', ['X', 'Y'], 1, 'Nah');

      const result = await repo.findQuestions('q1');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('maps question fields correctly', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      seedQuestion(
        db,
        1,
        'q1',
        'What is 2+2?',
        ['3', '4', '5'],
        1,
        'Basic math',
      );

      const result = await repo.findQuestions('q1');
      expect(result[0]).toEqual({
        id: 1,
        question: 'What is 2+2?',
        options: ['3', '4', '5'],
        correctAnswer: 1,
        explanation: 'Basic math',
      });
    });
  });
});

describe('SqliteAttemptRepository', () => {
  let db: Database;
  let repo: SqliteAttemptRepository;

  beforeEach(async () => {
    db = await createDb();
    repo = new SqliteAttemptRepository(db);
  });

  describe('create', () => {
    it('creates an attempt and returns it with id and createdAt', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      const attempt = await repo.create({
        quizId: 'q1',
        username: 'alice',
        answers: { 1: 0 },
        score: 1,
        total: 1,
      });

      expect(attempt.id).toBeGreaterThan(0);
      expect(attempt.quizId).toBe('q1');
      expect(attempt.username).toBe('alice');
      expect(attempt.score).toBe(1);
      expect(attempt.total).toBe(1);
      expect(attempt.createdAt).toBeTruthy();
    });

    it('increments id on successive creates', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      const a1 = await repo.create({ quizId: 'q1', username: 'a', answers: {}, score: 0, total: 1 });
      const a2 = await repo.create({ quizId: 'q1', username: 'b', answers: {}, score: 0, total: 1 });
      expect(a2.id).toBe(a1.id + 1);
    });
  });

  describe('findById', () => {
    it('returns null for non-existent attempt', async () => {
      const result = await repo.findById(999);
      expect(result).toBeNull();
    });

    it('returns the attempt when found', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      const created = await repo.create({ quizId: 'q1', username: 'alice', answers: { 1: 0 }, score: 1, total: 1 });
      const found = await repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.score).toBe(1);
    });
  });

  describe('findByUsername', () => {
    it('returns empty array for user with no attempts', async () => {
      const result = await repo.findByUsername('nobody');
      expect(result).toEqual([]);
    });

    it('returns attempts ordered by created_at DESC', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      // Insert attempts with explicit timestamps to guarantee ordering
      db.run(
        "INSERT INTO attempts (quiz_id, username, answers, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        ['q1', 'alice', JSON.stringify({}), 1, 1, '2026-01-01T00:00:00.000Z'],
      );
      db.run(
        "INSERT INTO attempts (quiz_id, username, answers, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        ['q1', 'alice', JSON.stringify({}), 2, 2, '2026-01-02T00:00:00.000Z'],
      );

      const results = await repo.findByUsername('alice');
      expect(results).toHaveLength(2);
      expect(results[0].score).toBe(2); // most recent first
      expect(results[1].score).toBe(1);
    });

    it('only returns attempts for the specified user', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      await repo.create({ quizId: 'q1', username: 'alice', answers: {}, score: 1, total: 1 });
      await repo.create({ quizId: 'q1', username: 'bob', answers: {}, score: 2, total: 2 });

      const results = await repo.findByUsername('alice');
      expect(results).toHaveLength(1);
      expect(results[0].username).toBe('alice');
    });
  });
});

describe('SqliteUserRepository', () => {
  let db: Database;
  let repo: SqliteUserRepository;

  beforeEach(async () => {
    db = await createDb();
    repo = new SqliteUserRepository(db);
  });

  describe('findOrCreate', () => {
    it('creates a new user when username does not exist', async () => {
      const user = await repo.findOrCreate('newuser');
      expect(user.username).toBe('newuser');
      expect(user.id).toBeGreaterThan(0);
      expect(user.createdAt).toBeTruthy();
    });

    it('returns existing user when username already exists', async () => {
      const first = await repo.findOrCreate('existing');
      const second = await repo.findOrCreate('existing');
      expect(second.id).toBe(first.id);
      expect(second.username).toBe(first.username);
    });
  });

  describe('findByUsername', () => {
    it('returns null for non-existent user', async () => {
      const result = await repo.findByUsername('nobody');
      expect(result).toBeNull();
    });

    it('returns the user when found', async () => {
      await repo.findOrCreate('testuser');
      const found = await repo.findByUsername('testuser');
      expect(found).not.toBeNull();
      expect(found!.username).toBe('testuser');
    });
  });
});

describe('SqliteUserDashboardRepository', () => {
  let db: Database;
  let repo: SqliteUserDashboardRepository;

  beforeEach(async () => {
    db = await createDb();
    repo = new SqliteUserDashboardRepository(db);
  });

  describe('getStats', () => {
    it('returns zero stats for user with no attempts', async () => {
      const stats = await repo.getStats('nobody');
      expect(stats).toEqual({
        username: 'nobody',
        totalAttempts: 0,
        averageScore: 0,
        quizzesCompleted: 0,
      });
    });

    it('calculates correct stats from attempt data', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      seedQuiz(db, 'q2', 'Quiz 2', 'Desc');

      // Alice: 2 attempts on q1 (scored 3/5 and 4/5), 1 attempt on q2 (scored 5/5)
      seedAttempt(db, 'q1', 'alice', { 1: 0 }, 3, 5);
      seedAttempt(db, 'q1', 'alice', { 1: 1 }, 4, 5);
      seedAttempt(db, 'q2', 'alice', { 1: 0 }, 5, 5);

      const stats = await repo.getStats('alice');
      expect(stats.username).toBe('alice');
      expect(stats.totalAttempts).toBe(3);
      expect(stats.quizzesCompleted).toBe(2);
      // avg = ((3/5 + 4/5 + 5/5) / 3) * 100 = (0.6 + 0.8 + 1.0) / 3 * 100 = 80
      expect(stats.averageScore).toBe(80);
    });
  });

  describe('getAttemptHistory', () => {
    it('returns empty array for user with no attempts', async () => {
      const result = await repo.getAttemptHistory('nobody');
      expect(result).toEqual([]);
    });

    it('returns attempts ordered by date DESC', async () => {
      seedQuiz(db, 'q1', 'Quiz', 'Desc');
      db.run(
        "INSERT INTO attempts (quiz_id, username, answers, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        ['q1', 'alice', JSON.stringify({ 1: 0 }), 3, 5, '2026-01-01T00:00:00.000Z'],
      );
      db.run(
        "INSERT INTO attempts (quiz_id, username, answers, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        ['q1', 'alice', JSON.stringify({ 1: 1 }), 4, 5, '2026-01-02T00:00:00.000Z'],
      );

      const results = await repo.getAttemptHistory('alice');
      expect(results).toHaveLength(2);
      expect(results[0].score).toBe(4);
    });
  });
});

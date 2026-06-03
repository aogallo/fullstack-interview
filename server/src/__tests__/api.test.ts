import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { SCHEMA_SQL } from '../db/schema';
import { createRepositories } from '../repositories/wiring';
import { QuizCatalogService } from '../services/quizCatalogService';
import { QuizTakingService } from '../services/quizTakingService';
import { QuizResultsService } from '../services/quizResultsService';
import { UserService } from '../services/userService';
import { DashboardService } from '../services/dashboardService';
import { QuizController } from '../controllers/quizController';
import { AttemptController } from '../controllers/attemptController';
import { UserController } from '../controllers/userController';
import { createQuizRouter } from '../routes/quizRoutes';
import { createAttemptRouter } from '../routes/attemptRoutes';
import { createUserRouter } from '../routes/userRoutes';

// ---------------------------------------------------------------------------
// Build a test app with an in-memory SQLite database
// ---------------------------------------------------------------------------

let app: express.Express;
let db: Database;

async function buildTestApp(): Promise<express.Express> {
  const SQL: SqlJsStatic = await initSqlJs();
  db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);

  const app = express();
  app.use(express.json());

  const repos = createRepositories(db);
  const quizCatalogService = new QuizCatalogService(repos.quizRepo);
  const quizTakingService = new QuizTakingService(repos.quizRepo);
  const quizResultsService = new QuizResultsService(repos.attemptRepo, repos.quizRepo);
  const userService = new UserService(repos.userRepo);
  const dashboardService = new DashboardService(repos.dashboardRepo);

  const quizController = new QuizController(quizCatalogService, quizTakingService);
  const attemptController = new AttemptController(quizResultsService);
  const userController = new UserController(userService, dashboardService);

  app.use('/api/quizzes', createQuizRouter(quizController));
  app.use('/api', createAttemptRouter(attemptController));
  app.use('/api/users', createUserRouter(userController));

  return app;
}

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

function seedQuiz(id: string, title: string, description: string): void {
  db.run('INSERT INTO quizzes (id, title, description) VALUES (?, ?, ?)', [
    id,
    title,
    description,
  ]);
}

function seedQuestion(
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeAll(async () => {
  app = await buildTestApp();
});

describe('GET /api/quizzes', () => {
  it('returns empty array when no quizzes exist', async () => {
    const res = await request(app).get('/api/quizzes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all quizzes', async () => {
    seedQuiz('test-1', 'Test Quiz', 'A test');
    const res = await request(app).get('/api/quizzes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Test Quiz');
  });
});

describe('GET /api/quizzes/:id', () => {
  it('returns 404 for non-existent quiz', async () => {
    const res = await request(app).get('/api/quizzes/non-existent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Quiz not found');
  });

  it('returns quiz with questions when found', async () => {
    seedQuiz('math-1', 'Math Quiz', 'Test your math');
    seedQuestion(1, 'math-1', 'What is 2+2?', ['3', '4', '5'], 1, 'Basic math');
    seedQuestion(2, 'math-1', 'What is 3*3?', ['6', '9', '12'], 1, 'Multiplication');

    const res = await request(app).get('/api/quizzes/math-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('math-1');
    expect(res.body.questions).toHaveLength(2);
    expect(res.body.questions[0].question).toBe('What is 2+2?');
  });
});

describe('POST /api/quizzes/:id/submit', () => {
  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/quizzes/math-1/submit')
      .send({ answers: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username and answers are required');
  });

  it('returns 400 when answers are missing', async () => {
    const res = await request(app)
      .post('/api/quizzes/math-1/submit')
      .send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username and answers are required');
  });

  it('creates attempt with correct score and performance', async () => {
    const res = await request(app)
      .post('/api/quizzes/math-1/submit')
      .send({ username: 'alice', answers: { 1: 1, 2: 1 } });
    expect(res.status).toBe(201);
    expect(res.body.score).toBe(2);
    expect(res.body.total).toBe(2);
    expect(res.body.percentage).toBe(100);
    expect(res.body.performance).toBe('Excellent');
  });

  it('returns lower performance tier for low scores', async () => {
    seedQuiz('hard-1', 'Hard Quiz', 'Very hard');
    seedQuestion(10, 'hard-1', 'Q1', ['A', 'B'], 1, 'E1');
    seedQuestion(11, 'hard-1', 'Q2', ['A', 'B'], 0, 'E2');

    const res = await request(app)
      .post('/api/quizzes/hard-1/submit')
      .send({ username: 'bob', answers: { 10: 0, 11: 1 } });
    expect(res.status).toBe(201);
    expect(res.body.percentage).toBe(0);
    expect(res.body.performance).toBe('Needs review');
  });
});

describe('GET /api/attempts/:id', () => {
  it('returns 400 for invalid attempt id', async () => {
    const res = await request(app).get('/api/attempts/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid attempt ID');
  });

  it('returns 404 for non-existent attempt', async () => {
    const res = await request(app).get('/api/attempts/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Attempt not found');
  });

  it('returns attempt with computed fields', async () => {
    const submitRes = await request(app)
      .post('/api/quizzes/math-1/submit')
      .send({ username: 'alice', answers: { 1: 1, 2: 1 } });
    const attemptId = submitRes.body.id;

    const res = await request(app).get(`/api/attempts/${attemptId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(attemptId);
    expect(res.body.percentage).toBe(100);
  });
});

describe('POST /api/users', () => {
  it('returns 400 for empty username', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username is required');
  });

  it('creates a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'testuser' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testuser');
    expect(res.body.id).toBeGreaterThan(0);
  });

  it('returns existing user on duplicate', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ username: 'testuser' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testuser');
  });
});

describe('GET /api/users/:username/stats', () => {
  it('returns zero stats for user with no attempts', async () => {
    const res = await request(app).get('/api/users/newuser/stats');
    expect(res.status).toBe(200);
    expect(res.body.totalAttempts).toBe(0);
    expect(res.body.averageScore).toBe(0);
  });

  it('returns computed stats for user with attempts', async () => {
    const res = await request(app).get('/api/users/alice/stats');
    expect(res.status).toBe(200);
    expect(res.body.totalAttempts).toBeGreaterThan(0);
  });
});

describe('GET /api/users/:username/attempts', () => {
  it('returns empty array for user with no attempts', async () => {
    const res = await request(app).get('/api/users/nobody/attempts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns attempts for user with history', async () => {
    const res = await request(app).get('/api/users/alice/attempts');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].username).toBe('alice');
  });
});

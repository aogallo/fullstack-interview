/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database, QueryExecResult } from 'sql.js';
import { Quiz, Question, Attempt, User, UserStats } from '../../types';
import {
  IQuizRepository,
  IAttemptRepository,
  IUserRepository,
  IUserDashboardRepository,
} from '../interfaces';

// ---------------------------------------------------------------------------
// Helpers for sql.js — `db.exec()` does not support bound parameters, so we
// use `db.prepare()` + `bind()` + `step()` for parameterized queries.
// ---------------------------------------------------------------------------

/** Execute a non-parameterized SELECT via exec(). */
function execRaw(db: Database, sql: string): QueryExecResult[] {
  return db.exec(sql);
}

/** Run a parameterized query and map every returned row through a mapper. */
function queryAll<T>(
  db: Database,
  sql: string,
  params: any[],
  mapper: (row: Record<string, any>) => T,
): T[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, any>;
      results.push(mapper(row));
    }
    return results;
  } finally {
    stmt.free();
  }
}

/** Run a parameterized query and return the first row, or null. */
function queryOne<T>(
  db: Database,
  sql: string,
  params: any[],
  mapper: (row: Record<string, any>) => T,
): T | null {
  const rows = queryAll(db, sql, params, mapper);
  return rows.length > 0 ? rows[0] : null;
}

/** Get the last inserted auto-increment ID. */
function lastInsertId(db: Database): number {
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function mapQuizRow(row: Record<string, any>): Quiz {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    questions: [],
  };
}

function mapQuestionRow(row: Record<string, any>): Question {
  return {
    id: row.id as number,
    question: row.question as string,
    options: JSON.parse(row.options as string) as string[],
    correctAnswer: row.correct_answer as number,
    explanation: row.explanation as string,
  };
}

function mapAttemptRow(row: Record<string, any>): Attempt {
  return {
    id: row.id as number,
    quizId: row.quiz_id as string,
    username: (row.username as string | null) ?? null,
    answers: JSON.parse(row.answers as string) as Record<number, number>,
    score: row.score as number,
    total: row.total as number,
    createdAt: row.created_at as string,
  };
}

function mapUserRow(row: Record<string, any>): User {
  return {
    id: row.id as number,
    username: row.username as string,
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// SQLite repository implementations
// ---------------------------------------------------------------------------

export class SqliteQuizRepository implements IQuizRepository {
  constructor(private db: Database) {}

  async findAll(): Promise<Quiz[]> {
    const results = execRaw(this.db, 'SELECT id, title, description FROM quizzes ORDER BY title');
    if (results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return mapQuizRow(obj);
    });
  }

  async findById(id: string): Promise<Quiz | null> {
    return queryOne(
      this.db,
      'SELECT id, title, description FROM quizzes WHERE id = ?',
      [id],
      mapQuizRow,
    );
  }

  async findQuestions(quizId: string): Promise<Question[]> {
    return queryAll(
      this.db,
      'SELECT id, question, options, correct_answer, explanation FROM questions WHERE quiz_id = ? ORDER BY id',
      [quizId],
      mapQuestionRow,
    );
  }
}

export class SqliteAttemptRepository implements IAttemptRepository {
  constructor(private db: Database) {}

  async create(attempt: Omit<Attempt, 'id' | 'createdAt'>): Promise<Attempt> {
    this.db.run(
      'INSERT INTO attempts (quiz_id, username, answers, score, total) VALUES (?, ?, ?, ?, ?)',
      [
        attempt.quizId,
        attempt.username,
        JSON.stringify(attempt.answers),
        attempt.score,
        attempt.total,
      ],
    );
    const id = lastInsertId(this.db);
    // Re-fetch to get the generated created_at
    const saved = await this.findById(id);
    if (!saved) {
      throw new Error('Failed to retrieve saved attempt');
    }
    return saved;
  }

  async findById(id: number): Promise<Attempt | null> {
    return queryOne(
      this.db,
      'SELECT id, quiz_id, username, answers, score, total, created_at FROM attempts WHERE id = ?',
      [id],
      mapAttemptRow,
    );
  }

  async findByUsername(username: string): Promise<Attempt[]> {
    return queryAll(
      this.db,
      'SELECT id, quiz_id, username, answers, score, total, created_at FROM attempts WHERE username = ? ORDER BY created_at DESC',
      [username],
      mapAttemptRow,
    );
  }
}

export class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findOrCreate(username: string): Promise<User> {
    const existing = await this.findByUsername(username);
    if (existing) return existing;

    this.db.run('INSERT INTO users (username) VALUES (?)', [username]);
    const id = lastInsertId(this.db);
    return {
      id,
      username,
      createdAt: new Date().toISOString(),
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    return queryOne(
      this.db,
      'SELECT id, username, created_at FROM users WHERE username = ?',
      [username],
      mapUserRow,
    );
  }
}

export class SqliteUserDashboardRepository implements IUserDashboardRepository {
  constructor(private db: Database) {}

  async getStats(username: string): Promise<UserStats> {
    const row = queryOne(
      this.db,
      `SELECT
        COUNT(*) as total_attempts,
        COALESCE(ROUND(AVG(CAST(score AS REAL) / CAST(total AS REAL)) * 100, 1), 0) as average_score,
        COUNT(DISTINCT quiz_id) as quizzes_completed
      FROM attempts
      WHERE username = ?`,
      [username],
      (r) => ({
        username,
        totalAttempts: r.total_attempts as number,
        averageScore: r.average_score as number,
        quizzesCompleted: r.quizzes_completed as number,
      }),
    );

    return (
      row ?? {
        username,
        totalAttempts: 0,
        averageScore: 0,
        quizzesCompleted: 0,
      }
    );
  }

  async getAttemptHistory(username: string): Promise<Attempt[]> {
    return queryAll(
      this.db,
      'SELECT id, quiz_id, username, answers, score, total, created_at FROM attempts WHERE username = ? ORDER BY created_at DESC',
      [username],
      mapAttemptRow,
    );
  }
}

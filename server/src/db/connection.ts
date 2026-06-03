import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { SCHEMA_SQL } from './schema';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'quiz-app.db');

let SQL: SqlJsStatic | null = null;
let db: SqlJsDatabase | null = null;

async function initSql(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const wasm = await initSql();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new wasm.Database(buffer);
    } else {
      db = new wasm.Database();
    }

    db.run('PRAGMA foreign_keys = ON;');
    db.run(SCHEMA_SQL);

    persistDb();
  }
  return db;
}

export function persistDb(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function closeDb(): void {
  if (db) {
    persistDb();
    db.close();
    db = null;
  }
}

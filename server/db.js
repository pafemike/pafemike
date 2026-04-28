import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/aiyedrix.db';
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    role        TEXT,
    company     TEXT,
    companies   TEXT,
    resume_text TEXT,
    jd_text     TEXT,
    language    TEXT NOT NULL DEFAULT 'English (US)',
    is_default  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
`);

// Idempotent migrations for any DBs created before the schema above existed.
function columns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name);
}
function ensureColumn(table, name, ddl) {
  if (!columns(table).includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}
ensureColumn('profiles', 'title',      "title TEXT NOT NULL DEFAULT ''");
ensureColumn('profiles', 'companies',  "companies TEXT");
ensureColumn('profiles', 'is_default', "is_default INTEGER NOT NULL DEFAULT 0");
ensureColumn('profiles', 'created_at', "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");

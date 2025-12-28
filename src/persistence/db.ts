// src/persistence/db.ts
/**
 * Creates and exports a shared SQLite database connection
 * using better-sqlite3 (CommonJS-safe import).
 */

import Database = require("better-sqlite3");

const db = new Database("memory.db", {
  readonly: false,
  fileMustExist: false,
});

// Safe SQLite defaults
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

export default db;

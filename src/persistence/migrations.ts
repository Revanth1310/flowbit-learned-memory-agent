// src/persistence/migrations.ts
/**
 * migrations.ts
 * ---------------
 * Defines and runs database schema migrations.
 * This file is idempotent and safe to run multiple times.
 * It should be executed once during application startup.
 */

import db from "./db";

/**
 * Runs all database migrations.
 * Uses CREATE TABLE IF NOT EXISTS to ensure idempotency.
 */
export function runMigrations(): void {
  // Stores vendor-specific learned patterns
  db.prepare(`
    CREATE TABLE IF NOT EXISTS vendor_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor TEXT NOT NULL,
      pattern TEXT NOT NULL,
      meaning TEXT NOT NULL,
      confidence REAL NOT NULL,
      usage_count INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `).run();

  // Stores repeated correction strategies
  db.prepare(`
    CREATE TABLE IF NOT EXISTS correction_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor TEXT,
      issue_type TEXT NOT NULL,
      action TEXT NOT NULL,
      confidence REAL NOT NULL,
      reinforcement_count INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `).run();

  // Stores final outcomes of invoice issues
  db.prepare(`
    CREATE TABLE IF NOT EXISTS resolution_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor TEXT,
      issue_type TEXT NOT NULL,
      resolution TEXT NOT NULL, -- approved / rejected
      confidence REAL NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `).run();

  // Stores explainability and audit logs
  db.prepare(`
    CREATE TABLE IF NOT EXISTS audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT,
      step TEXT, -- recall | apply | decide | learn
      details TEXT,
      timestamp TEXT
    )
  `).run();
}

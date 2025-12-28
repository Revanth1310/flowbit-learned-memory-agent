// src/memory/vendorMemory.ts
/**
 * vendorMemory.ts
 * ----------------
 * Handles vendor-specific learned patterns.
 *
 * Responsibilities:
 * - Store vendor-specific patterns (e.g., "Leistungsdatum" → serviceDate)
 * - Retrieve memory for recall
 * - Reinforce confidence when memory is reused successfully
 * - Decay confidence when memory leads to wrong decisions
 */

import db from "../persistence/db";

/**
 * Shape of a vendor memory record
 */
export interface VendorMemoryRecord {
  id: number;
  vendor: string;
  pattern: string;
  meaning: string;
  confidence: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieve all learned vendor memory entries for a given vendor,
 * ordered by confidence (highest first)
 */
export function getVendorMemory(vendor: string): VendorMemoryRecord[] {
  const stmt = db.prepare(`
    SELECT *
    FROM vendor_memory
    WHERE vendor = ?
    ORDER BY confidence DESC
  `);

  return stmt.all(vendor) as VendorMemoryRecord[];
}

/**
 * Save a new vendor memory entry.
 * Initial confidence is deliberately low (0.5) to avoid unsafe automation.
 * Duplicate vendor + pattern entries are prevented.
 */
export function saveVendorMemory(
  vendor: string,
  pattern: string,
  meaning: string
): void {
  const now = new Date().toISOString();

  const exists: { id: number } | undefined = db
    .prepare(
      `
      SELECT id
      FROM vendor_memory
      WHERE vendor = ? AND pattern = ?
    `
    )
    .get(vendor, pattern) as { id: number } | undefined;

  if (exists) {
    return;
  }

  db.prepare(
    `
    INSERT INTO vendor_memory (
      vendor,
      pattern,
      meaning,
      confidence,
      usage_count,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(vendor, pattern, meaning, 0.5, 0, now, now);
}

/**
 * Reinforce vendor memory when it is confirmed by human approval.
 * Confidence increases gradually and is capped at 1.0.
 */
export function reinforceVendorMemory(id: number): void {
  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE vendor_memory
    SET
      confidence = MIN(confidence + 0.1, 1.0),
      usage_count = usage_count + 1,
      updated_at = ?
    WHERE id = ?
  `
  ).run(now, id);
}

/**
 * Decay vendor memory confidence when it leads to incorrect behavior.
 * This prevents bad learnings from dominating over time.
 */
export function decayVendorMemory(id: number): void {
  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE vendor_memory
    SET
      confidence = MAX(confidence - 0.2, 0.0),
      updated_at = ?
    WHERE id = ?
  `
  ).run(now, id);
}

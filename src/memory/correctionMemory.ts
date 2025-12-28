// src/memory/correctionMemory.ts
/**
 * correctionMemory.ts
 * -------------------
 * Stores and manages correction strategies learned from human feedback.
 */

import db from "../persistence/db";

// Retrieve correction memory by vendor (if provided) and issue type
export function getCorrectionMemory(
  vendor: string | null,
  issueType: string
) {
  if (vendor) {
    return db.prepare(`
      SELECT *
      FROM correction_memory
      WHERE vendor = ? AND issue_type = ?
      ORDER BY confidence DESC
    `).all(vendor, issueType);
  }

  return db.prepare(`
    SELECT *
    FROM correction_memory
    WHERE vendor IS NULL AND issue_type = ?
    ORDER BY confidence DESC
  `).all(issueType);
}

// Save a new correction strategy if it does not already exist
export function saveCorrectionMemory(
  vendor: string | null,
  issueType: string,
  action: string
) {
  const now = new Date().toISOString();

  const exists = db.prepare(`
    SELECT id FROM correction_memory
    WHERE vendor IS ? AND issue_type = ? AND action = ?
  `).get(vendor, issueType, action);

  if (exists) {
    return;
  }

  db.prepare(`
    INSERT INTO correction_memory (
      vendor,
      issue_type,
      action,
      confidence,
      reinforcement_count,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(vendor, issueType, action, 0.5, 0, now, now);
}

// Increase confidence when a correction is reused successfully
export function reinforceCorrectionMemory(id: number) {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE correction_memory
    SET
      confidence = MIN(confidence + 0.05, 1.0),
      reinforcement_count = reinforcement_count + 1,
      updated_at = ?
    WHERE id = ?
  `).run(now, id);
}

// Decrease confidence when a correction is rejected
export function penalizeCorrectionMemory(id: number) {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE correction_memory
    SET
      confidence = MAX(confidence - 0.1, 0.0),
      updated_at = ?
    WHERE id = ?
  `).run(now, id);
}

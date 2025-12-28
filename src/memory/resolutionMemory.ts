// src/memory/resolutionMemory.ts
/**
 * resolutionMemory.ts
 * -------------------
 * Stores final resolution outcomes (approved / rejected) for recurring issues.
 * Prevents contradictory or duplicate learning.
 */

import db from "../persistence/db";

// Retrieve resolution history for a vendor + issue type
export function getResolutionMemory(
  vendor: string | null,
  issueType: string
) {
  if (vendor) {
    return db.prepare(`
      SELECT *
      FROM resolution_memory
      WHERE vendor = ? AND issue_type = ?
      ORDER BY created_at DESC
    `).all(vendor, issueType);
  }

  return db.prepare(`
    SELECT *
    FROM resolution_memory
    WHERE vendor IS NULL AND issue_type = ?
    ORDER BY created_at DESC
  `).all(issueType);
}

// Save a resolution outcome if it does not contradict existing memory
export function saveResolutionMemory(
  vendor: string | null,
  issueType: string,
  resolution: "approved" | "rejected"
) {
  const now = new Date().toISOString();

  const existing = db.prepare(`
    SELECT resolution
    FROM resolution_memory
    WHERE vendor IS ? AND issue_type = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(vendor, issueType) as { resolution?: string } | undefined;

  // Prevent contradictory learning
  if (existing && existing.resolution !== resolution) {
    return;
  }

  db.prepare(`
    INSERT INTO resolution_memory (
      vendor,
      issue_type,
      resolution,
      confidence,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(vendor, issueType, resolution, 0.7, now, now);
}

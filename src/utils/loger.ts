// src/utils/logger.ts
/**
 * logger.ts
 * ----------
 * Centralized audit logging utility.
 *
 * This module is responsible for:
 * - Creating human-readable audit trail entries
 * - Ensuring consistent structure across the system
 * - Keeping logging logic separate from business logic
 *
 * ⚠️ This file does NOT decide what to log.
 * It only formats and stores what other modules tell it to log.
 */

import db from "../persistence/db";

/**
 * Allowed audit steps in the agent lifecycle
 */
export type AuditStep = "recall" | "apply" | "decide" | "learn";

/**
 * Shape of an audit trail entry
 */
export interface AuditEntry {
  invoiceId: string;
  step: AuditStep;
  details: string;
  timestamp?: string;
}

/**
 * Write an audit trail entry to the database.
 *
 * This function is synchronous and deterministic.
 */
export function writeAuditLog(entry: AuditEntry): void {
  const timestamp = entry.timestamp ?? new Date().toISOString();

  db.prepare(
    `
    INSERT INTO audit_trail (
      invoice_id,
      step,
      details,
      timestamp
    )
    VALUES (?, ?, ?, ?)
  `
  ).run(entry.invoiceId, entry.step, entry.details, timestamp);
}

/**
 * Convenience helper for logging recall actions
 */
export function logRecall(
  invoiceId: string,
  details: string
): void {
  writeAuditLog({
    invoiceId,
    step: "recall",
    details,
  });
}

/**
 * Convenience helper for logging apply actions
 */
export function logApply(
  invoiceId: string,
  details: string
): void {
  writeAuditLog({
    invoiceId,
    step: "apply",
    details,
  });
}

/**
 * Convenience helper for logging decision actions
 */
export function logDecide(
  invoiceId: string,
  details: string
): void {
  writeAuditLog({
    invoiceId,
    step: "decide",
    details,
  });
}

/**
 * Convenience helper for logging learning actions
 */
export function logLearn(
  invoiceId: string,
  details: string
): void {
  writeAuditLog({
    invoiceId,
    step: "learn",
    details,
  });
}

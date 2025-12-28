// src/engine/learn.ts
/**
 * learn.ts
 * --------
 * Learns from human feedback and updates long-term memory.
 *
 * This is the ONLY place where:
 * - Confidence is updated
 * - New memory is created
 * - Audit trail is written
 *
 * This file performs WRITES and is intentionally stateful.
 */

import db from "../persistence/db";
import { Invoice } from "../types/invoice";
import {
  saveVendorMemory,
  reinforceVendorMemory,
  getVendorMemory
} from "../memory/vendorMemory";
import {
  saveCorrectionMemory,
  getCorrectionMemory,
  reinforceCorrectionMemory
} from "../memory/correctionMemory";
import { saveResolutionMemory } from "../memory/resolutionMemory";

/**
 * Shape of human feedback input
 */
export interface HumanFeedback {
  corrections: {
    field: string;
    from: any;
    to: any;
    reason: string;
  }[];
  finalDecision: "approved" | "rejected";
}

/**
 * Output shape of learning step
 */
export interface LearnResult {
  memoryUpdates: string[];
}

/**
 * learn
 * -----
 * Updates memory based on explicit human feedback.
 */
export function learn(
  invoice: Invoice,
  humanFeedback: HumanFeedback
): LearnResult {
  const memoryUpdates: string[] = [];
  const now = new Date().toISOString();

  /**
   * 1. Prevent duplicate learning for the same invoice
   */
  const alreadyLearned = db
    .prepare(
      `
      SELECT 1 FROM audit_trail
      WHERE invoice_id = ?
      LIMIT 1
    `
    )
    .get(invoice.invoiceId);

  if (alreadyLearned) {
    return {
      memoryUpdates: [
        `Invoice ${invoice.invoiceId} already learned. Skipping duplicate learning.`,
      ],
    };
  }

  /**
   * 2. Process each human correction
   */
  for (const correction of humanFeedback.corrections) {
    const { field, from, to, reason } = correction;

    /**
     * Heuristic:
     * - Structural field corrections → vendor memory
     * - Procedural fixes → correction memory
     */
    const isVendorSpecific =
      invoice.vendor !== "" &&
      typeof field === "string" &&
      field.toLowerCase().includes("date");

    if (isVendorSpecific) {
      // Vendor memory logic
      const existingVendorMemory = getVendorMemory(invoice.vendor).find(
        (vm) => vm.pattern === field
      );

      if (existingVendorMemory) {
        reinforceVendorMemory(existingVendorMemory.id);
        memoryUpdates.push(
          `Reinforced vendor memory for ${invoice.vendor}: ${field}`
        );
      } else {
        saveVendorMemory(invoice.vendor, field, String(to));
        memoryUpdates.push(
          `Learned vendor pattern for ${invoice.vendor}: ${field} → ${to}`
        );
      }
    } else {
      // Correction memory logic
      const existingCorrectionMemory = getCorrectionMemory(
        invoice.vendor,
        field
      );

      if (existingCorrectionMemory) {
        reinforceCorrectionMemory(existingCorrectionMemory.id);
        memoryUpdates.push(
          `Reinforced correction strategy for issue "${field}"`
        );
      } else {
        saveCorrectionMemory(invoice.vendor, field, reason);
        memoryUpdates.push(
          `Learned correction strategy for issue "${field}": ${reason}`
        );
      }
    }

    /**
     * Write audit trail entry for correction learning
     */
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
    ).run(
      invoice.invoiceId,
      "learn",
      `Correction applied: field "${field}" changed from "${from}" to "${to}". Reason: ${reason}`,
      now
    );
  }

  /**
   * 3. Store final resolution outcome
   */
  saveResolutionMemory(
    invoice.vendor,
    "final_decision",
    humanFeedback.finalDecision
  );

  memoryUpdates.push(
    `Learned final resolution for vendor ${invoice.vendor}: ${humanFeedback.finalDecision}`
  );

  /**
   * 4. Write audit trail entry for resolution learning
   */
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
  ).run(
    invoice.invoiceId,
    "learn",
    `Final decision recorded: ${humanFeedback.finalDecision}`,
    now
  );

  /**
   * 5. Return human-readable learning summary
   */
  return {
    memoryUpdates,
  };
}

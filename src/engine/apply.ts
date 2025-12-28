// src/engine/apply.ts
/**
 * apply.ts
 * --------
 * Applies recalled learned memory to an invoice and produces:
 * - Normalized invoice fields (suggested, not enforced)
 * - Proposed correction strategies
 * - Human-readable reasoning
 *
 * ⚠️ IMPORTANT:
 * - No database writes
 * - No learning
 * - No final decisions (approve / reject)
 * - Read-only, suggestion-only logic
 */

import { Invoice } from "../types/invoice";
import {
  RecalledMemory,
  VendorMemory,
  CorrectionMemory,
  ResolutionMemory,
} from "./recall";

/**
 * Output shape of apply phase
 */
export interface AppliedMemoryResult {
  normalizedInvoice: Record<string, unknown>;
  proposedCorrections: string[];
  reasoning: string[];
  confidenceScore: number;
}

/**
 * applyMemory
 * -----------
 * Applies recalled memory to the invoice and generates suggestions.
 *
 * Rules:
 * - Confidence ≥ 0.7   → strong suggestion
 * - Confidence 0.4–0.69 → weak suggestion
 * - Confidence < 0.4   → ignored
 */
export function applyMemory(
  invoice: Invoice,
  recalledMemory: RecalledMemory
): AppliedMemoryResult {
  // Clone invoice fields to avoid mutating the original invoice
  const normalizedInvoice: Record<string, unknown> = {
    ...invoice.fields,
  };

  const proposedCorrections: string[] = [];
  const reasoning: string[] = [];

  let confidenceAccumulator = 0;
  let confidenceCount = 0;

  /**
   * 1. Apply vendor-specific memory
   */
  for (const memory of recalledMemory.vendorMemory as VendorMemory[]) {
    if (memory.confidence < 0.4) continue;

    const strength = memory.confidence >= 0.7 ? "strong" : "weak";

    reasoning.push(
      `(${strength}) Vendor pattern detected: "${memory.pattern}" → ${memory.meaning}`
    );

    // Only auto-apply strong vendor memory
    if (memory.confidence >= 0.7) {
      normalizedInvoice[memory.pattern] = memory.meaning;
    }

    confidenceAccumulator += memory.confidence;
    confidenceCount++;
  }

  /**
   * 2. Apply correction memory
   */
  for (const memory of recalledMemory.correctionMemory as CorrectionMemory[]) {
    if (memory.confidence < 0.4) continue;

    const strength = memory.confidence >= 0.7 ? "strong" : "weak";

    proposedCorrections.push(memory.action);

    reasoning.push(
      `(${strength}) Suggested correction for issue "${memory.issue_type}": ${memory.action}`
    );

    confidenceAccumulator += memory.confidence;
    confidenceCount++;
  }

  /**
   * 3. Apply resolution memory (context only)
   */
  for (const memory of recalledMemory.resolutionMemory as ResolutionMemory[]) {
    if (memory.confidence < 0.4) continue;

    const strength = memory.confidence >= 0.7 ? "strong" : "weak";

    reasoning.push(
      `(${strength}) Historical resolution for issue "${memory.issue_type}": ${memory.resolution}`
    );

    confidenceAccumulator += memory.confidence;
    confidenceCount++;
  }

  /**
   * 4. Aggregate confidence score
   */
  const confidenceScore =
    confidenceCount > 0
      ? Number((confidenceAccumulator / confidenceCount).toFixed(2))
      : 0;

  /**
   * 5. Return suggestion-only result
   */
  return {
    normalizedInvoice,
    proposedCorrections,
    reasoning,
    confidenceScore,
  };
}

// src/engine/decide.ts
/**
 * decide.ts
 * ----------
 * Makes the final decision for an invoice based on applied memory.
 *
 * Possible outcomes:
 * - Auto-correct (safe, high confidence)
 * - Escalate for human review
 *
 * ⚠️ IMPORTANT:
 * - No database writes
 * - No learning
 * - No memory updates
 * - Decision-only logic
 */

// src/engine/decide.ts

import { Invoice } from "../types/invoice";
import { RecalledMemory } from "./recall";


/**
 * Shape of the applyMemory output
 */
export interface ApplyResult {
  normalizedInvoice: any;
  proposedCorrections: string[];
  reasoning: string[];
  confidenceScore: number;
}

/**
 * Final decision output
 */
export interface DecisionResult {
  normalizedInvoice: any;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
}

/**
 * decide
 * ------
 * Determines whether an invoice can be auto-processed
 * or must be escalated for human review.
 *
 * Decision Rules:
 * - confidence >= 0.75 and no risky corrections → auto-correct
 * - confidence 0.5–0.74 → human review required
 * - confidence < 0.5 → human review required
 */
export function decide(
  invoice: Invoice,
  applyResult: ApplyResult
): DecisionResult {
  const {
    normalizedInvoice,
    proposedCorrections,
    reasoning,
    confidenceScore,
  } = applyResult;

  /**
   * Define what counts as a risky correction.
   * In finance systems, anything touching tax, totals,
   * or payments should be reviewed by a human.
   */
  const riskyKeywords = ["tax", "vat", "total", "amount", "payment"];

  const hasRiskyCorrection = proposedCorrections.some((correction) =>
    riskyKeywords.some((keyword) =>
      correction.toLowerCase().includes(keyword)
    )
  );

  let requiresHumanReview = true;
  let decisionReasoning = "";

  /**
   * Apply decision rules explicitly
   */
  if (confidenceScore >= 0.75 && !hasRiskyCorrection) {
    requiresHumanReview = false;
    decisionReasoning =
      "High confidence memory with no risky corrections detected. Invoice can be auto-corrected safely.";
  } else if (confidenceScore >= 0.5 && confidenceScore < 0.75) {
    requiresHumanReview = true;
    decisionReasoning =
      "Moderate confidence detected. Suggested corrections require human validation.";
  } else {
    requiresHumanReview = true;
    decisionReasoning =
      "Low confidence detected. Invoice requires full human review.";
  }

  /**
   * Return final decision result
   */
  return {
    normalizedInvoice,
    proposedCorrections,
    requiresHumanReview,
    reasoning: decisionReasoning,
    confidenceScore,
  };
}

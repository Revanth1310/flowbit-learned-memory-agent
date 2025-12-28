// src/types/output.ts
/**
 * output.ts
 * ----------
 * Defines the mandatory output contract for the agent,
 * as required by the assignment.
 */

/**
 * Final agent output structure
 */
export interface AgentOutput {
  /** Normalized invoice fields after applying learned memory */
  normalizedInvoice: Record<string, any>;

  /** List of proposed correction actions */
  proposedCorrections: string[];

  /** Whether the invoice requires human review */
  requiresHumanReview: boolean;

  /** Human-readable reasoning for the decision */
  reasoning: string;

  /** Aggregated confidence score used for decision-making */
  confidenceScore: number;

  /** Human-readable descriptions of memory updates performed */
  memoryUpdates: string[];

  /**
   * Full audit trail explaining agent behavior step-by-step
   */
  auditTrail: {
    /** Processing step */
    step: "recall" | "apply" | "decide" | "learn";

    /** ISO timestamp of the step */
    timestamp: string;

    /** Detailed explanation of what happened in this step */
    details: string;
  }[];
}

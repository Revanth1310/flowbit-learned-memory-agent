// src/types/memory.ts
/**
 * memory.ts
 * ----------
 * Defines the structure of all learned memory records
 * used by the system for recall, application, and learning.
 */

/**
 * Vendor-specific learned patterns
 * Example: how a vendor represents service dates or totals
 */
export interface VendorMemory {
  /** Unique memory record ID */
  id: number;

  /** Vendor name */
  vendor: string;

  /** Observed pattern (e.g., "Leistungsdatum") */
  pattern: string;

  /** Interpreted meaning (e.g., "serviceDate") */
  meaning: string;

  /** Confidence of this learned memory (0 to 1) */
  confidence: number;

  /** Number of times this memory was successfully used */
  usageCount: number;
}

/**
 * Learned correction strategies from human feedback
 * Example: how to fix VAT or date formatting issues
 */
export interface CorrectionMemory {
  /** Unique memory record ID */
  id: number;

  /** Vendor name (null for global corrections) */
  vendor: string | null;

  /** Type of issue this correction applies to */
  issueType: string;

  /** Action or strategy to correct the issue */
  action: string;

  /** Confidence of this correction strategy (0 to 1) */
  confidence: number;

  /** Number of times this correction was reinforced */
  reinforcementCount: number;
}

/**
 * Learned final resolutions for recurring issues
 * Example: whether a certain issue is usually approved or rejected
 */
export interface ResolutionMemory {
  /** Unique memory record ID */
  id: number;

  /** Vendor name (null for global resolution patterns) */
  vendor: string | null;

  /** Type of issue this resolution applies to */
  issueType: string;

  /** Final resolution outcome */
  resolution: "approved" | "rejected";

  /** Confidence of this resolution pattern (0 to 1) */
  confidence: number;
}

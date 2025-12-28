// src/engine/recall.ts
/**
 * recall.ts
 * ----------
 * Responsible for recalling all relevant learned memory for an invoice
 * BEFORE any decision or learning happens.
 *
 * This file is strictly READ-ONLY.
 * No updates, no confidence changes, no learning.
 */

import { Invoice } from "../types/invoice";
import { getVendorMemory } from "../memory/vendorMemory";
import { getCorrectionMemory } from "../memory/correctionMemory";
import { getResolutionMemory } from "../memory/resolutionMemory";

/**
 * Memory record shapes (as returned from DB)
 * Typed explicitly for strict mode safety
 */
export interface VendorMemory {
  id: number;
  vendor: string;
  pattern: string;
  meaning: string;
  confidence: number;
  usage_count: number;
}

export interface CorrectionMemory {
  id: number;
  vendor: string | null;
  issue_type: string;
  action: string;
  confidence: number;
  reinforcement_count: number;
}

export interface ResolutionMemory {
  id: number;
  vendor: string | null;
  issue_type: string;
  resolution: "approved" | "rejected";
  confidence: number;
}

/**
 * Structured result returned by recall phase
 */
export interface RecalledMemory {
  vendorMemory: VendorMemory[];
  correctionMemory: CorrectionMemory[];
  resolutionMemory: ResolutionMemory[];
}

/**
 * recallMemory
 * ------------
 * Collects all relevant learned memory for an invoice.
 *
 * - Vendor memory is recalled purely by vendor
 * - Correction & resolution memory are recalled only if issue types are known
 * - No mutation, no decisions, no learning
 */
export function recallMemory(invoice: Invoice): RecalledMemory {
  /**
   * 1. Recall vendor-specific learned patterns
   */
  const vendorMemory = getVendorMemory(invoice.vendor) as VendorMemory[];

  /**
   * 2. Detect issue types (if any)
   * Expected in invoice.fields.issueTypes as string[]
   */
  const issueTypes = Array.isArray(invoice.fields["issueTypes"])
    ? (invoice.fields["issueTypes"] as string[])
    : [];

  /**
   * 3. Recall correction & resolution memory only when issues exist
   */
  const correctionMemory: CorrectionMemory[] = [];
  const resolutionMemory: ResolutionMemory[] = [];

  for (const issueType of issueTypes) {
    // Vendor-specific + global correction memory
    correctionMemory.push(
      ...(getCorrectionMemory(invoice.vendor, issueType) as CorrectionMemory[]),
      ...(getCorrectionMemory(null, issueType) as CorrectionMemory[])
    );

    // Vendor-specific + global resolution memory
    resolutionMemory.push(
      ...(getResolutionMemory(invoice.vendor, issueType) as ResolutionMemory[]),
      ...(getResolutionMemory(null, issueType) as ResolutionMemory[])
    );
  }

  /**
   * 4. Return recalled memory
   */
  return {
    vendorMemory,
    correctionMemory,
    resolutionMemory,
  };
}

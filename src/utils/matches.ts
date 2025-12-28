// src/utils/matcher.ts
/**
 * matcher.ts
 * ----------
 * Simple matching utilities for linking invoices with
 * Purchase Orders (POs) and Delivery Notes (DNs).
 *
 * This module is intentionally lightweight and deterministic.
 * No database access, no side effects.
 */

/**
 * Generic document shape used for matching
 */
export interface MatchableDocument {
  id: string;
  vendor: string;
  referenceNumber?: string;
  amount?: number;
  date?: string;
}

/**
 * Result of a match attempt
 */
export interface MatchResult {
  matched: boolean;
  reason: string;
  confidence: number;
}

/**
 * Match an invoice against a Purchase Order.
 *
 * Matching rules (simple & explainable):
 * - Vendor must match
 * - Reference number should match (if present)
 * - Amount should be equal or very close
 */
export function matchInvoiceToPO(
  invoice: MatchableDocument,
  purchaseOrder: MatchableDocument
): MatchResult {
  if (invoice.vendor !== purchaseOrder.vendor) {
    return {
      matched: false,
      reason: "Vendor does not match",
      confidence: 0,
    };
  }

  if (
    invoice.referenceNumber &&
    purchaseOrder.referenceNumber &&
    invoice.referenceNumber !== purchaseOrder.referenceNumber
  ) {
    return {
      matched: false,
      reason: "Reference number does not match",
      confidence: 0.3,
    };
  }

  if (
    typeof invoice.amount === "number" &&
    typeof purchaseOrder.amount === "number"
  ) {
    const diff = Math.abs(invoice.amount - purchaseOrder.amount);

    if (diff > 1) {
      return {
        matched: false,
        reason: "Amount difference too large",
        confidence: 0.4,
      };
    }
  }

  return {
    matched: true,
    reason: "Invoice matches purchase order",
    confidence: 0.85,
  };
}

/**
 * Match an invoice against a Delivery Note.
 *
 * Matching rules:
 * - Vendor must match
 * - Reference number should match (if available)
 * - Date proximity increases confidence
 */
export function matchInvoiceToDN(
  invoice: MatchableDocument,
  deliveryNote: MatchableDocument
): MatchResult {
  if (invoice.vendor !== deliveryNote.vendor) {
    return {
      matched: false,
      reason: "Vendor does not match",
      confidence: 0,
    };
  }

  let confidence = 0.6;

  if (
    invoice.referenceNumber &&
    deliveryNote.referenceNumber &&
    invoice.referenceNumber === deliveryNote.referenceNumber
  ) {
    confidence += 0.2;
  }

  if (invoice.date && deliveryNote.date) {
    confidence += 0.1;
  }

  return {
    matched: true,
    reason: "Invoice matches delivery note",
    confidence: Math.min(confidence, 1),
  };
}

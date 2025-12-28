// src/types/invoice.ts
/**
 * invoice.ts
 * ----------
 * Defines the structure of an extracted invoice input.
 * This is the primary input contract for the agent pipeline.
 */

export interface Invoice {
  /** Unique identifier of the invoice */
  invoiceId: string;

  /** Vendor or supplier name */
  vendor: string;

  /**
   * Extracted invoice fields (key-value pairs).
   * Example: { invoiceDate: "2024-01-01", totalAmount: 1234.56 }
   */
  fields: Record<string, any>;

  /** Confidence score of the extraction process (0 to 1) */
  confidence: number;

  /** Raw text extracted from the invoice document */
  rawText: string;
}

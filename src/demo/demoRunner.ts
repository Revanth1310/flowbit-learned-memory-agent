// src/demo/demoRunner.ts
/**
 * demoRunner.ts
 * --------------
 * Demonstrates learning over time for the invoice processing agent.
 *
 * This demo shows:
 * 1. First invoice with no prior memory → human review required
 * 2. Learning from human feedback
 * 3. Second invoice from same vendor → smarter suggestions & higher confidence
 */

import fs from "fs";
import path from "path";

import { runMigrations } from "../persistence/migrations";
import { recallMemory } from "../engine/recall";
import { applyMemory } from "../engine/apply";
import { decide } from "../engine/decide";
import { learn } from "../engine/learn";

import { Invoice } from "../types/invoice";

/**
 * Load JSON helper
 */
function loadJSON<T>(relativePath: string): T {
  const fullPath = path.join(__dirname, "..", relativePath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

/**
 * Demo entry point
 */
function runDemo(): void {
  console.log("=== Invoice Memory Learning Demo ===\n");

  /**
   * 0. Ensure database schema exists
   */
  runMigrations();

  /**
   * 1. Load sample data
   */
  const invoices = loadJSON<Invoice[]>("data/invoices_extracted.json");
  const humanCorrections = loadJSON<any[]>("data/human_corrections.json");

  /**
   * -----------------------------
   * PROCESS INVOICE #1
   * -----------------------------
   */
  const invoice1 = invoices.find(
    (inv) => inv.invoiceId === "INV-A-001"
  );

  if (!invoice1) {
    throw new Error("Invoice INV-A-001 not found in sample data");
  }

  console.log(`--- Processing Invoice ${invoice1.invoiceId} ---`);

  // Recall
  const recalled1 = recallMemory(invoice1);
  console.log(
    `Memory found: ${
      recalled1.vendorMemory.length === 0 ? "none" : "yes"
    }`
  );

  // Apply
  const applied1 = applyMemory(invoice1, recalled1);

  // Decide
  const decision1 = decide(invoice1, applied1);

  console.log(
    decision1.requiresHumanReview
      ? "Human review required"
      : "Auto-processed"
  );
  console.log(`Confidence: ${decision1.confidenceScore}\n`);

  /**
   * Learn from human feedback
   */
  const feedback1 = humanCorrections.find(
    (c) => c.invoiceId === "INV-A-001"
  );

  if (!feedback1) {
    throw new Error("Human correction for INV-A-001 not found");
  }

  console.log("Learning from human correction...");

  const learnResult1 = learn(invoice1, feedback1);

  for (const update of learnResult1.memoryUpdates) {
    console.log(update);
  }

  console.log("\n");

  /**
   * -----------------------------
   * PROCESS INVOICE #2
   * -----------------------------
   */
  const invoice2 = invoices.find(
    (inv) =>
      inv.invoiceId === "INV-A-002" ||
      inv.invoiceId === "INV-A-003"
  );

  if (!invoice2) {
    throw new Error("Second related invoice not found in sample data");
  }

  console.log(`--- Processing Invoice ${invoice2.invoiceId} ---`);

  // Recall (should now find memory)
  const recalled2 = recallMemory(invoice2);
  console.log(
    `Memory found for vendor ${invoice2.vendor}: ${
      recalled2.vendorMemory.length > 0 ? "yes" : "no"
    }`
  );

  // Apply
  const applied2 = applyMemory(invoice2, recalled2);

  console.log("Suggested normalizations / corrections:");
  for (const reason of applied2.reasoning) {
    console.log(`- ${reason}`);
  }

  // Decide
  const decision2 = decide(invoice2, applied2);

  console.log(
    decision2.requiresHumanReview
      ? "Human review required"
      : "Auto-correct possible"
  );
  console.log(`Confidence: ${decision2.confidenceScore}`);

  console.log("\n=== Demo Complete ===");
}

/**
 * Run demo
 */
runDemo();

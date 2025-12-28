// src/demo/loadSampleData.ts
/**
 * loadSampleData.ts
 * -----------------
 * Utility for loading sample JSON data used by the demo.
 *
 * This file keeps demoRunner.ts clean and focused on
 * demonstrating learning over time.
 *
 * No business logic lives here.
 * Only file loading and parsing.
 */

import fs from "fs";
import path from "path";

/**
 * Load and parse a JSON file from src/data/.
 *
 * @param fileName - name of the JSON file
 */
function loadJSON<T>(fileName: string): T {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData) as T;
}

/**
 * Load extracted invoices
 */
export function loadInvoices<T>(): T[] {
  return loadJSON<T[]>("invoices_extracted.json");
}

/**
 * Load human correction feedback
 */
export function loadHumanCorrections<T>(): T[] {
  return loadJSON<T[]>("human_corrections.json");
}

/**
 * Load purchase orders (optional demo extension)
 */
export function loadPurchaseOrders<T>(): T[] {
  return loadJSON<T[]>("purchase_orders.json");
}

/**
 * Load delivery notes (optional demo extension)
 */
export function loadDeliveryNotes<T>(): T[] {
  return loadJSON<T[]>("delivery_notes.json");
}

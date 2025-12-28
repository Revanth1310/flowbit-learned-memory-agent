// src/index.ts
/**
 * index.ts
 * ---------
 * Main entry point of the Learned Memory Agent application.
 *
 * Responsibilities:
 * - Initialize SQLite database
 * - Run migrations safely
 * - Start the demo runner
 * - Handle startup errors gracefully
 */

import "./persistence/db"; // Ensures database is initialized
import { runMigrations } from "./persistence/migrations";

function startApplication(): void {
  try {
    console.log("Starting Learned Memory Agent...\n");

    // Initialize database schema
    console.log("Initializing SQLite database...");
    runMigrations();
    console.log("Database ready.\n");

    // Start demo runner (runs on import)
    console.log("Running demo...\n");
    require("./demo/demoRunner");

    console.log("\nDemo completed.");
  } catch (error) {
    console.error("Failed to start Learned Memory Agent.");
    console.error(error);
    process.exit(1);
  }
}

// Application entry
startApplication();

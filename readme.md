# Flowbit Learned Memory Agent 🧠📄

## Description

**Flowbit Learned Memory Agent** is a TypeScript-based backend system that demonstrates how an intelligent, agent-style system can **learn from human feedback over time** while processing invoices.

The system simulates a real-world invoice processing pipeline with:

- Memory recall (past learnings)
- Memory application (normalization & suggestions)
- Decision-making (auto-process vs human review)
- Learning from human corrections
- Persistent storage using SQLite

### Core Idea

> The **first invoice** from a vendor requires human review.  
> After learning from human corrections, **subsequent invoices** from the same vendor are processed more intelligently with **higher confidence and fewer flags**.

The architecture is **beginner-friendly**, **finance-safe**, and **fully explainable**.

---

## Steps to Download & Run the Project from GitHub

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/flowbit-learned-memory-agent.git
cd flowbit-learned-memory-agent
```
### 2️⃣ Install dependencies
```bash
npm install
```
### 3️⃣ Run the application
```bash
npm run start
```

### This will:

-Initialize the SQLite database

-Run migrations safely

-Execute a demo showing learning across invoices

### Folder Structure
```graphql
flowbit-learned-memory-agent/
│
├── src/
│   ├── engine/                 # Core agent logic (brain)
│   │   ├── recall.ts           # Recall relevant memory
│   │   ├── apply.ts            # Apply memory & propose corrections
│   │   ├── decide.ts           # Decide auto / human review
│   │   └── learn.ts            # Learn from human feedback
│   │
│   ├── memory/                 # Memory models & DB access
│   │   ├── vendorMemory.ts     # Vendor-specific learnings
│   │   ├── correctionMemory.ts # Repeated correction strategies
│   │   └── resolutionMemory.ts # Approved / rejected outcomes
│   │
│   ├── persistence/            # Storage layer
│   │   ├── db.ts               # SQLite connection
│   │   └── migrations.ts       # Table creation
│   │
│   ├── demo/                   # Demo & simulation
│   │   ├── demoRunner.ts       # Runs Invoice #1 → #2 learning demo
│   │   └── loadSampleData.ts   # Loads provided sample JSON
│   │
│   ├── data/                   # Sample input data
│   │   ├── invoices_extracted.json
│   │   ├── purchase_orders.json
│   │   ├── delivery_notes.json
│   │   └── human_corrections.json
│   │
│   ├── types/                  # TypeScript type contracts
│   │   ├── invoice.ts
│   │   ├── memory.ts
│   │   └── output.ts
│   │
│   ├── utils/                  # Helper utilities
│   │   ├── confidence.ts       # Reinforcement & decay logic
│   │   ├── matcher.ts          # PO / DN matching logic
│   │   └── logger.ts           # Audit logging
│   │
│   ├── config.ts               # Thresholds & constants
│   │   └── index.ts            # Main entry point
│
├── memory.db                   # SQLite DB (auto-generated)
├── package.json
├── tsconfig.json               # strict = true
└── README.md
```
### Input / Output Format
📥 Input: Invoice
```interface Invoice {
  invoiceId: string;
  vendor: string;
  fields: Record<string, any>;
  confidence: number;
  rawText: string;
}```


Example (invoices_extracted.json):

```{
  "invoiceId": "INV-A-001",
  "vendor": "Supplier GmbH",
  "fields": {
    "Leistungsdatum": "01.02.2024",
    "totalAmount": 1200
  },
  "confidence": 0.72,
  "rawText": "Rechnung Nr. INV-A-001 ..."
}```

📥 Input: Human Feedback
```{
  corrections: {
    field: string;
    from: any;
    to: any;
    reason: string;
  }[];
  finalDecision: "approved" | "rejected";
}```


Example (human_corrections.json):

```
{
  "invoiceId": "INV-A-001",
  "corrections": [
    {
      "field": "Leistungsdatum",
      "from": "01.02.2024",
      "to": "serviceDate",
      "reason": "German invoices use Leistungsdatum"
    }
  ],
  "finalDecision": "approved"
}
```

📤 Output: Agent Output
```interface AgentOutput {
  normalizedInvoice: Record<string, any>;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  memoryUpdates: string[];
  auditTrail: {
    step: "recall" | "apply" | "decide" | "learn";
    timestamp: string;
    details: string;
  }[];
}```

### Required Imports & Dependencies
Runtime & Language

- Node.js

- TypeScript (strict mode)

- Database

- SQLite

- better-sqlite3

### Development Dependencies
```
npm install --save-dev typescript ts-node @types/node
```

### Common Imports Used
```import Database = require("better-sqlite3");
import fs from "fs";
import path from "path";
```
### What This Project Demonstrates

- ✅ Learned memory over time

- ✅ Human-in-the-loop learning

- ✅ Explainable decision-making

- ✅ Finance-safe automation

- ✅ Clean, modular backend architecture

### Resetting Learned Memory (Optional)

To reset the system learning:

'''rm memory.db
npm run start
'''
## ⚠️ Note on Code Generation Assistance

Important Declaration:
Parts of this project’s codebase were generated with the assistance of ChatGPT and then reviewed, customized, and integrated by me.
The overall system design, architecture decisions, data flow, and final validation were performed by me to ensure correctness, explainability, and assignment requirements compliance.
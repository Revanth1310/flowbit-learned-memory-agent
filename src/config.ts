// src/config.ts
/**
 * config.ts
 * ----------
 * Central place for system-wide configuration values.
 *
 * This file defines:
 * - Confidence thresholds
 * - Reinforcement & decay values
 * - Safety limits for automation
 *
 * Keeping these values here makes the system:
 * - Easy to tune
 * - Easy to explain
 * - Easy to audit
 *
 * ⚠️ No business logic should live here.
 * Only constants.
 */

/**
 * Confidence thresholds used across the agent
 */
export const CONFIDENCE_THRESHOLDS = {
  /** Minimum confidence to auto-correct without human review */
  AUTO_CORRECT: 0.75,

  /** Minimum confidence to suggest corrections (but still require review) */
  SUGGEST_WITH_REVIEW: 0.5,

  /** Below this, everything requires human review */
  MINIMUM: 0.0,
};

/**
 * Confidence adjustment values during learning
 */
export const CONFIDENCE_ADJUSTMENTS = {
  /** Starting confidence for newly learned memory */
  INITIAL: 0.5,

  /** Increase when a memory is accepted */
  REINFORCE: 0.1,

  /** Decrease when a memory is rejected */
  DECAY: 0.2,
};

/**
 * Safety configuration for financial automation
 */
export const SAFETY_RULES = {
  /**
   * Keywords that indicate risky corrections.
   * Any correction touching these must go to human review.
   */
  RISKY_KEYWORDS: ["tax", "vat", "total", "amount", "payment"],

  /**
   * Maximum number of auto-applied corrections allowed.
   * Prevents large-scale silent changes.
   */
  MAX_AUTO_CORRECTIONS: 3,
};

/**
 * Demo configuration
 */
export const DEMO_CONFIG = {
  /** Whether to print verbose logs during demo */
  VERBOSE_LOGGING: true,
};

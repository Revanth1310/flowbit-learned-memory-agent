// src/utils/confidence.ts
/**
 * confidence.ts
 * --------------
 * Centralized confidence reinforcement and decay logic.
 *
 * This utility ensures:
 * - Consistent confidence updates across the system
 * - Confidence always stays within [0, 1]
 * - Simple, explainable math for beginners
 */

/**
 * Clamp a value between 0 and 1
 */
function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(2));
}

/**
 * Increase confidence when a memory is successfully used or accepted.
 *
 * @param currentConfidence - existing confidence value
 * @param increment - amount to increase (default: 0.1)
 */
export function reinforceConfidence(
  currentConfidence: number,
  increment: number = 0.1
): number {
  return clamp(currentConfidence + increment);
}

/**
 * Decrease confidence when a memory is rejected or leads to an error.
 *
 * @param currentConfidence - existing confidence value
 * @param penalty - amount to decrease (default: 0.2)
 */
export function decayConfidence(
  currentConfidence: number,
  penalty: number = 0.2
): number {
  return clamp(currentConfidence - penalty);
}

/**
 * Calculate an average confidence score from multiple values.
 * Used for aggregation in apply / decide phases.
 *
 * @param confidences - array of confidence numbers
 */
export function averageConfidence(confidences: number[]): number {
  if (confidences.length === 0) {
    return 0;
  }

  const sum = confidences.reduce((acc, value) => acc + value, 0);
  return clamp(sum / confidences.length);
}

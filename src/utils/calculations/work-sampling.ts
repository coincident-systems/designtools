/**
 * Work Sampling Calculations
 *
 * Based on statistical sampling theory for work measurement.
 * Reference: Niebel & Freivalds, "Methods, Standards, and Work Design"
 */

// Z-values for common confidence levels
export const CONFIDENCE_LEVELS = [
  { value: "0.90", label: "90%", alpha: 0.1, z: 1.645 },
  { value: "0.95", label: "95%", alpha: 0.05, z: 1.96 },
  { value: "0.99", label: "99%", alpha: 0.01, z: 2.576 },
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]["value"];

/**
 * Get the z-value for a given confidence level
 * @param confidence - Confidence level as string (e.g., "0.95")
 * @returns z-value for the confidence level
 */
export function getZValue(confidence: string): number {
  const level = CONFIDENCE_LEVELS.find((c) => c.value === confidence);
  if (!level) {
    throw new Error(`Invalid confidence level: ${confidence}`);
  }
  return level.z;
}

/**
 * Calculate required sample size for work sampling study
 *
 * Formula: n = (z² × p × (1-p)) / l²
 *
 * @param p - Estimated proportion/probability of occurrence (0 to 1)
 * @param z - z-value corresponding to desired confidence level
 * @param l - Maximum acceptable limit of error (e.g., 0.05 for ±5%)
 * @returns Required number of observations (rounded up)
 * @throws Error if inputs are invalid
 */
export function calculateSampleSize(p: number, z: number, l: number): number {
  // Validate inputs
  if (p < 0 || p > 1) {
    throw new Error("Probability (p) must be between 0 and 1");
  }
  if (z <= 0) {
    throw new Error("Z-value must be positive");
  }
  if (l <= 0) {
    throw new Error("Error limit (l) must be positive");
  }
  if (l > 1) {
    throw new Error("Error limit (l) should not exceed 1 (100%)");
  }

  // Handle edge cases
  if (p === 0 || p === 1) {
    return 0; // No variability, no samples needed
  }

  const n = (z * z * p * (1 - p)) / (l * l);
  return Math.ceil(n);
}

/**
 * Calculate maximum error limit for given sample size
 *
 * Formula: l = z × √(p × (1-p) / n)
 *
 * @param p - Estimated proportion/probability of occurrence (0 to 1)
 * @param z - z-value corresponding to desired confidence level
 * @param n - Sample size (number of observations)
 * @returns Maximum error limit as decimal (e.g., 0.05 for ±5%)
 * @throws Error if inputs are invalid
 */
export function calculateErrorLimit(p: number, z: number, n: number): number {
  // Validate inputs
  if (p < 0 || p > 1) {
    throw new Error("Probability (p) must be between 0 and 1");
  }
  if (z <= 0) {
    throw new Error("Z-value must be positive");
  }
  if (n <= 0) {
    throw new Error("Sample size (n) must be positive");
  }
  if (!Number.isInteger(n)) {
    throw new Error("Sample size (n) must be an integer");
  }

  // Handle edge cases
  if (p === 0 || p === 1) {
    return 0; // No variability
  }

  return z * Math.sqrt((p * (1 - p)) / n);
}

/**
 * Generate random observation times within a work period
 *
 * @param count - Number of random times to generate
 * @param startHour - Start of work period (24-hour format, default 8 = 8:00 AM)
 * @param endHour - End of work period (24-hour format, default 17 = 5:00 PM)
 * @returns Array of formatted time strings sorted chronologically
 * @throws Error if inputs are invalid
 */
export function generateRandomObservationTimes(
  count: number,
  startHour = 8,
  endHour = 17
): string[] {
  // Validate inputs
  if (count <= 0) {
    throw new Error("Count must be positive");
  }
  if (count > 10000) {
    throw new Error("Count exceeds maximum (10000)");
  }
  if (startHour < 0 || startHour > 23) {
    throw new Error("Start hour must be between 0 and 23");
  }
  if (endHour < 0 || endHour > 24) {
    throw new Error("End hour must be between 0 and 24");
  }
  if (startHour >= endHour) {
    throw new Error("Start hour must be before end hour");
  }

  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const range = endMinutes - startMinutes;

  const times: Date[] = [];
  for (let i = 0; i < count; i++) {
    const randomMinutes = startMinutes + Math.floor(Math.random() * range);
    const hours = Math.floor(randomMinutes / 60);
    const minutes = randomMinutes % 60;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    times.push(date);
  }

  // Sort chronologically
  times.sort((a, b) => a.getTime() - b.getTime());

  return times.map((t) =>
    t.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
}

/**
 * Validate that a proportion value is valid (between 0 and 1)
 */
export function isValidProportion(p: number): boolean {
  return typeof p === "number" && !isNaN(p) && p >= 0 && p <= 1;
}

/**
 * Format error limit as percentage string
 */
export function formatErrorAsPercentage(l: number): string {
  return `±${(l * 100).toFixed(2)}%`;
}

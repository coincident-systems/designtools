/**
 * Learning Curve Calculations
 *
 * Learning curves model the reduction in time/cost as workers gain experience.
 * The standard model: Y = a * X^b
 * where:
 *   Y = time per unit for the Xth unit
 *   a = time for the first unit
 *   X = unit number
 *   b = learning exponent (negative for improvement)
 *
 * Learning rate (percent) = 2^b * 100
 * For example, an 80% learning curve means doubling production reduces time to 80%.
 */

export interface TwoPointInput {
  /** First point cycle number */
  x1: number;
  /** First point time/cost */
  y1: number;
  /** Second point cycle number */
  x2: number;
  /** Second point time/cost */
  y2: number;
}

export interface LearningCurveResult {
  /** Learning exponent (b in Y = a * X^b) */
  exponent: number;
  /** First unit time/cost (a in Y = a * X^b) */
  firstUnitValue: number;
  /** Learning rate as decimal (e.g., 0.80 for 80%) */
  learningRate: number;
  /** Learning rate as percentage (e.g., 80 for 80%) */
  learningRatePercent: number;
}

export interface RegressionInput {
  /** Array of cycle numbers (X values) */
  cycles: number[];
  /** Array of corresponding times/costs (Y values) */
  times: number[];
}

export interface RegressionResult extends LearningCurveResult {
  /** R-squared value (coefficient of determination) */
  rSquared: number;
  /** Standard error of estimate */
  standardError: number;
}

/**
 * Calculate learning curve parameters using the two-point method.
 *
 * Given two data points (X1, Y1) and (X2, Y2), calculates:
 * - Exponent b = log(Y2/Y1) / log(X2/X1)
 * - First unit value a = Y1 / (X1^b)
 * - Learning rate = 2^b
 *
 * @param input Two data points
 * @returns Learning curve parameters
 * @throws Error if inputs are invalid
 */
export function calculateTwoPointMethod(input: TwoPointInput): LearningCurveResult {
  const { x1, y1, x2, y2 } = input;

  // Validation
  if (x1 <= 0 || x2 <= 0) {
    throw new Error("Cycle numbers must be positive");
  }
  if (y1 <= 0 || y2 <= 0) {
    throw new Error("Time/cost values must be positive");
  }
  if (x1 === x2) {
    throw new Error("Cycle numbers must be different");
  }
  if (x2 <= x1) {
    throw new Error("Second cycle number must be greater than first");
  }
  if (y2 >= y1) {
    throw new Error("Second time must be less than first (learning improvement)");
  }

  // Calculate exponent: b = log(Y2/Y1) / log(X2/X1)
  const exponent = Math.log(y2 / y1) / Math.log(x2 / x1);

  // Calculate first unit value: a = Y1 / X1^b
  const firstUnitValue = y1 / Math.pow(x1, exponent);

  // Calculate learning rate: 2^b
  const learningRate = Math.pow(2, exponent);
  const learningRatePercent = Math.round(learningRate * 10000) / 100; // Round to 2 decimals

  return {
    exponent,
    firstUnitValue,
    learningRate,
    learningRatePercent,
  };
}

/**
 * Calculate learning curve parameters using linear regression on log-transformed data.
 *
 * Takes the natural log of both X and Y values, then performs linear regression
 * to find the best-fit line: ln(Y) = ln(a) + b*ln(X)
 *
 * @param input Arrays of cycle numbers and corresponding times
 * @returns Learning curve parameters with regression statistics
 * @throws Error if inputs are invalid
 */
export function calculateRegressionMethod(input: RegressionInput): RegressionResult {
  const { cycles, times } = input;

  // Validation
  if (cycles.length !== times.length) {
    throw new Error("Cycles and times arrays must have the same length");
  }
  if (cycles.length < 2) {
    throw new Error("At least 2 data points are required");
  }
  if (cycles.some((x) => x <= 0)) {
    throw new Error("All cycle numbers must be positive");
  }
  if (times.some((y) => y <= 0)) {
    throw new Error("All time values must be positive");
  }

  const n = cycles.length;

  // Transform to log scale
  const logX = cycles.map((x) => Math.log(x));
  const logY = times.map((y) => Math.log(y));

  // Calculate means
  const meanLogX = logX.reduce((a, b) => a + b, 0) / n;
  const meanLogY = logY.reduce((a, b) => a + b, 0) / n;

  // Calculate regression coefficients
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = logX[i] - meanLogX;
    const dy = logY[i] - meanLogY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  // Slope (exponent b)
  const exponent = sumXY / sumX2;

  // Intercept (ln(a))
  const lnA = meanLogY - exponent * meanLogX;
  const firstUnitValue = Math.exp(lnA);

  // Learning rate
  const learningRate = Math.pow(2, exponent);
  const learningRatePercent = Math.round(learningRate * 10000) / 100;

  // R-squared
  const ssReg = sumXY * sumXY / sumX2;
  const ssTot = sumY2;
  const rSquared = ssTot > 0 ? ssReg / ssTot : 0;

  // Standard error
  const ssRes = ssTot - ssReg;
  const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  return {
    exponent,
    firstUnitValue,
    learningRate,
    learningRatePercent,
    rSquared,
    standardError,
  };
}

/**
 * Calculate time/cost for a specific cycle given learning curve parameters.
 *
 * @param cycle The cycle number to calculate for
 * @param firstUnitValue The first unit time/cost (a)
 * @param exponent The learning exponent (b)
 * @returns Predicted time/cost for that cycle
 */
export function predictTimeAtCycle(
  cycle: number,
  firstUnitValue: number,
  exponent: number
): number {
  if (cycle <= 0) {
    throw new Error("Cycle number must be positive");
  }
  return firstUnitValue * Math.pow(cycle, exponent);
}

/**
 * Calculate cumulative total time for all cycles up to n.
 *
 * Uses the closed-form approximation for the sum of a power series.
 *
 * @param n Total number of cycles
 * @param firstUnitValue The first unit time (a)
 * @param exponent The learning exponent (b)
 * @returns Approximate cumulative total time
 */
export function calculateCumulativeTime(
  n: number,
  firstUnitValue: number,
  exponent: number
): number {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error("Number of cycles must be a positive integer");
  }

  // For small n, calculate exactly
  if (n <= 1000) {
    let total = 0;
    for (let i = 1; i <= n; i++) {
      total += firstUnitValue * Math.pow(i, exponent);
    }
    return total;
  }

  // For large n, use approximation: sum ≈ a * (n^(b+1))/(b+1) + 0.5*a + (a*b)/(12)
  // This is based on the Euler-Maclaurin formula
  const bp1 = exponent + 1;
  if (Math.abs(bp1) < 0.0001) {
    // Handle case where b ≈ -1
    return firstUnitValue * (Math.log(n) + 0.5772156649); // Euler-Mascheroni constant
  }

  return (firstUnitValue * Math.pow(n, bp1)) / bp1 + firstUnitValue * 0.5;
}

/**
 * Calculate the learning curve exponent from a learning rate percentage.
 *
 * @param learningRatePercent Learning rate as percentage (e.g., 80 for 80%)
 * @returns The learning exponent b
 */
export function exponentFromLearningRate(learningRatePercent: number): number {
  if (learningRatePercent <= 0 || learningRatePercent >= 100) {
    throw new Error("Learning rate must be between 0 and 100 (exclusive)");
  }
  return Math.log(learningRatePercent / 100) / Math.log(2);
}

/**
 * Generate data points for plotting a learning curve.
 *
 * @param firstUnitValue The first unit time (a)
 * @param exponent The learning exponent (b)
 * @param maxCycles Maximum cycle number to generate
 * @param points Number of points to generate
 * @returns Array of {x, y} points for plotting
 */
export function generateCurvePoints(
  firstUnitValue: number,
  exponent: number,
  maxCycles: number,
  points: number = 50
): Array<{ x: number; y: number }> {
  if (maxCycles <= 1) {
    throw new Error("Maximum cycles must be greater than 1");
  }
  if (points < 2) {
    throw new Error("Must generate at least 2 points");
  }

  const result: Array<{ x: number; y: number }> = [];

  // Use logarithmic spacing for better visualization
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const x = Math.round(Math.exp(Math.log(1) + t * (Math.log(maxCycles) - Math.log(1))));
    const y = predictTimeAtCycle(Math.max(1, x), firstUnitValue, exponent);
    result.push({ x: Math.max(1, x), y });
  }

  return result;
}

/**
 * Common learning rate presets with their names.
 */
export const LEARNING_RATE_PRESETS = [
  { value: 70, label: "70% (Aerospace/Complex)" },
  { value: 75, label: "75% (Electronics)" },
  { value: 80, label: "80% (Standard Industrial)" },
  { value: 85, label: "85% (Repetitive Assembly)" },
  { value: 90, label: "90% (Simple Tasks)" },
] as const;

/**
 * Format a learning rate as a percentage string.
 */
export function formatLearningRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Format the exponent for display.
 */
export function formatExponent(exponent: number): string {
  return exponent.toFixed(4);
}

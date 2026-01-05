/**
 * Fitts' Law Calculator and Test
 * Based on Fitts, P.M. (1954)
 *
 * Fitts' Law predicts movement time for aimed movements:
 * MT = a + b × ID
 *
 * Where:
 * - MT = Movement Time
 * - a = Intercept (device/user start-up time)
 * - b = Slope (information processing time)
 * - ID = Index of Difficulty = log2(2D/W)
 * - D = Distance to target
 * - W = Width of target
 *
 * The Index of Performance (IP) or Throughput = ID/MT (bits/second)
 */

export interface FittsTarget {
  id: string;
  distance: number; // pixels
  width: number; // pixels
  indexOfDifficulty: number; // bits
}

export interface FittsTrial {
  targetId: string;
  distance: number;
  width: number;
  indexOfDifficulty: number;
  movementTime: number; // ms
  hit: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  targetX: number;
  targetY: number;
}

export interface FittsResult {
  /** Intercept (a) in ms */
  intercept: number;
  /** Slope (b) in ms/bit */
  slope: number;
  /** R-squared value of regression */
  rSquared: number;
  /** Index of Performance (throughput) in bits/s */
  throughput: number;
  /** Average movement time in ms */
  averageMovementTime: number;
  /** Error rate (% missed targets) */
  errorRate: number;
  /** Total trials */
  totalTrials: number;
  /** Successful trials */
  successfulTrials: number;
  /** Trials grouped by ID */
  trialsByDifficulty: Map<number, FittsTrial[]>;
}

/**
 * Calculate Index of Difficulty (Shannon formulation)
 * ID = log2((D / W) + 1)
 */
export function calculateIndexOfDifficulty(distance: number, width: number): number {
  if (width <= 0) return Infinity;
  return Math.log2(distance / width + 1);
}

/**
 * Calculate predicted movement time using Fitts' Law
 */
export function predictMovementTime(
  distance: number,
  width: number,
  a: number,
  b: number
): number {
  const id = calculateIndexOfDifficulty(distance, width);
  return a + b * id;
}

/**
 * Generate target configurations for a Fitts' Law test
 * Returns a variety of distance/width combinations
 */
export function generateTargetConfigurations(
  numConfigs: number = 9
): Array<{ distance: number; width: number }> {
  const distances = [100, 200, 400]; // pixels
  const widths = [20, 40, 80]; // pixels

  const configs: Array<{ distance: number; width: number }> = [];

  for (const d of distances) {
    for (const w of widths) {
      configs.push({ distance: d, width: w });
    }
  }

  // Sort by Index of Difficulty
  configs.sort(
    (a, b) =>
      calculateIndexOfDifficulty(a.distance, a.width) -
      calculateIndexOfDifficulty(b.distance, b.width)
  );

  return configs.slice(0, numConfigs);
}

/**
 * Perform linear regression on trial data
 * Returns slope, intercept, and R-squared
 */
export function performRegression(trials: FittsTrial[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  // Filter to successful trials only
  const validTrials = trials.filter((t) => t.hit);

  if (validTrials.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }

  // Group by ID and calculate mean MT for each ID
  const grouped = new Map<number, number[]>();
  for (const trial of validTrials) {
    const id = Math.round(trial.indexOfDifficulty * 100) / 100; // Round to avoid floating point issues
    if (!grouped.has(id)) {
      grouped.set(id, []);
    }
    grouped.get(id)!.push(trial.movementTime);
  }

  // Calculate mean MT for each ID
  const points: Array<{ x: number; y: number }> = [];
  for (const [id, times] of grouped) {
    const meanMT = times.reduce((a, b) => a + b, 0) / times.length;
    points.push({ x: id, y: meanMT });
  }

  if (points.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }

  // Linear regression
  const n = points.length;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  const ssTotal = points.reduce((a, p) => a + Math.pow(p.y - meanY, 2), 0);
  const ssResidual = points.reduce((a, p) => a + Math.pow(p.y - (intercept + slope * p.x), 2), 0);
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, rSquared };
}

/**
 * Analyze Fitts' Law test results
 */
export function analyzeFittsResults(trials: FittsTrial[]): FittsResult {
  const successfulTrials = trials.filter((t) => t.hit);
  const totalTrials = trials.length;
  const errorRate = totalTrials > 0 ? ((totalTrials - successfulTrials.length) / totalTrials) * 100 : 0;

  const { slope, intercept, rSquared } = performRegression(trials);

  // Average movement time (successful trials only)
  const averageMovementTime =
    successfulTrials.length > 0
      ? successfulTrials.reduce((a, t) => a + t.movementTime, 0) / successfulTrials.length
      : 0;

  // Throughput (Index of Performance)
  // Using effective ID based on actual movement amplitude and error rate
  const avgID =
    successfulTrials.length > 0
      ? successfulTrials.reduce((a, t) => a + t.indexOfDifficulty, 0) / successfulTrials.length
      : 0;

  const throughput = averageMovementTime > 0 ? (avgID / averageMovementTime) * 1000 : 0;

  // Group trials by difficulty
  const trialsByDifficulty = new Map<number, FittsTrial[]>();
  for (const trial of trials) {
    const id = Math.round(trial.indexOfDifficulty * 10) / 10;
    if (!trialsByDifficulty.has(id)) {
      trialsByDifficulty.set(id, []);
    }
    trialsByDifficulty.get(id)!.push(trial);
  }

  return {
    intercept,
    slope,
    rSquared,
    throughput,
    averageMovementTime,
    errorRate,
    totalTrials,
    successfulTrials: successfulTrials.length,
    trialsByDifficulty,
  };
}

/**
 * Generate a random position for a target at given distance from origin
 */
export function generateTargetPosition(
  originX: number,
  originY: number,
  distance: number,
  containerWidth: number,
  containerHeight: number,
  targetWidth: number
): { x: number; y: number } {
  // Random angle
  const angle = Math.random() * 2 * Math.PI;

  let x = originX + distance * Math.cos(angle);
  let y = originY + distance * Math.sin(angle);

  // Clamp to container bounds
  const halfWidth = targetWidth / 2;
  x = Math.max(halfWidth, Math.min(containerWidth - halfWidth, x));
  y = Math.max(halfWidth, Math.min(containerHeight - halfWidth, y));

  return { x, y };
}

/**
 * Check if a click hit the target
 */
export function checkHit(
  clickX: number,
  clickY: number,
  targetX: number,
  targetY: number,
  targetWidth: number
): boolean {
  const distance = Math.sqrt(Math.pow(clickX - targetX, 2) + Math.pow(clickY - targetY, 2));
  return distance <= targetWidth / 2;
}

/**
 * Format throughput with units
 */
export function formatThroughput(bitsPerSecond: number): string {
  return `${bitsPerSecond.toFixed(2)} bits/s`;
}

/**
 * Interpret Fitts' Law results
 */
export function interpretResults(result: FittsResult): string {
  const parts: string[] = [];

  if (result.rSquared >= 0.9) {
    parts.push("Excellent fit to Fitts' Law model (R² ≥ 0.90).");
  } else if (result.rSquared >= 0.7) {
    parts.push("Good fit to Fitts' Law model (R² ≥ 0.70).");
  } else {
    parts.push("Poor fit to model - results may not be reliable.");
  }

  if (result.throughput >= 4) {
    parts.push("Above-average throughput indicates efficient pointing performance.");
  } else if (result.throughput >= 3) {
    parts.push("Throughput is in the typical range for mouse pointing.");
  } else {
    parts.push("Below-average throughput may indicate interface or motor control issues.");
  }

  if (result.errorRate > 10) {
    parts.push(`High error rate (${result.errorRate.toFixed(1)}%) suggests targets may be too small.`);
  }

  return parts.join(" ");
}

/**
 * Time Study Calculations
 * Based on Niebel & Freivalds, Chapter 11
 *
 * Key concepts:
 * - Observed Time (OT): Actual measured time
 * - Normal Time (NT): OT adjusted for pace rating
 * - Standard Time (ST): NT plus allowances
 * - Westinghouse Rating: Skill, Effort, Conditions, Consistency
 */

// Westinghouse Rating Factor Tables
export const SKILL_RATINGS = {
  "A1": { label: "Superskill", value: 0.15 },
  "A2": { label: "Superskill", value: 0.13 },
  "B1": { label: "Excellent", value: 0.11 },
  "B2": { label: "Excellent", value: 0.08 },
  "C1": { label: "Good", value: 0.06 },
  "C2": { label: "Good", value: 0.03 },
  "D": { label: "Average", value: 0.00 },
  "E1": { label: "Fair", value: -0.05 },
  "E2": { label: "Fair", value: -0.10 },
  "F1": { label: "Poor", value: -0.16 },
  "F2": { label: "Poor", value: -0.22 },
} as const;

export const EFFORT_RATINGS = {
  "A1": { label: "Excessive", value: 0.13 },
  "A2": { label: "Excessive", value: 0.12 },
  "B1": { label: "Excellent", value: 0.10 },
  "B2": { label: "Excellent", value: 0.08 },
  "C1": { label: "Good", value: 0.05 },
  "C2": { label: "Good", value: 0.02 },
  "D": { label: "Average", value: 0.00 },
  "E1": { label: "Fair", value: -0.04 },
  "E2": { label: "Fair", value: -0.08 },
  "F1": { label: "Poor", value: -0.12 },
  "F2": { label: "Poor", value: -0.17 },
} as const;

export const CONDITIONS_RATINGS = {
  "A": { label: "Ideal", value: 0.06 },
  "B": { label: "Excellent", value: 0.04 },
  "C": { label: "Good", value: 0.02 },
  "D": { label: "Average", value: 0.00 },
  "E": { label: "Fair", value: -0.03 },
  "F": { label: "Poor", value: -0.07 },
} as const;

export const CONSISTENCY_RATINGS = {
  "A": { label: "Perfect", value: 0.04 },
  "B": { label: "Excellent", value: 0.03 },
  "C": { label: "Good", value: 0.01 },
  "D": { label: "Average", value: 0.00 },
  "E": { label: "Fair", value: -0.02 },
  "F": { label: "Poor", value: -0.04 },
} as const;

export type SkillRating = keyof typeof SKILL_RATINGS;
export type EffortRating = keyof typeof EFFORT_RATINGS;
export type ConditionsRating = keyof typeof CONDITIONS_RATINGS;
export type ConsistencyRating = keyof typeof CONSISTENCY_RATINGS;

export interface WestinghouseRating {
  skill: SkillRating;
  effort: EffortRating;
  conditions: ConditionsRating;
  consistency: ConsistencyRating;
}

export interface TimeStudyElement {
  id: string;
  name: string;
  observations: number[];
  rating?: WestinghouseRating;
}

export interface TimeStudyResult {
  observedTime: number;
  normalTime: number;
  standardTime: number;
  ratingFactor: number;
  allowanceFactor: number;
  statistics: {
    mean: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    range: number;
    min: number;
    max: number;
    count: number;
  };
}

/**
 * Calculate Westinghouse performance rating factor
 */
export function calculateWestinghouseRating(rating: WestinghouseRating): number {
  const skillValue = SKILL_RATINGS[rating.skill].value;
  const effortValue = EFFORT_RATINGS[rating.effort].value;
  const conditionsValue = CONDITIONS_RATINGS[rating.conditions].value;
  const consistencyValue = CONSISTENCY_RATINGS[rating.consistency].value;

  // Rating factor = 1 + sum of all adjustments
  return 1 + skillValue + effortValue + conditionsValue + consistencyValue;
}

/**
 * Calculate statistics for a set of observations
 */
export function calculateStatistics(observations: number[]): TimeStudyResult["statistics"] {
  if (observations.length === 0) {
    return {
      mean: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      range: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const count = observations.length;
  const sum = observations.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const squaredDiffs = observations.map((x) => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (count - 1 || 1);
  const standardDeviation = Math.sqrt(variance);

  const coefficientOfVariation = mean !== 0 ? (standardDeviation / mean) * 100 : 0;

  const sorted = [...observations].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  return {
    mean,
    standardDeviation,
    coefficientOfVariation,
    range,
    min,
    max,
    count,
  };
}

/**
 * Calculate required sample size for time study
 * Using formula: n = (t * s / (k * x̄))²
 * Where:
 * - t = t-value for desired confidence level
 * - s = sample standard deviation
 * - k = desired accuracy (as decimal, e.g., 0.05 for ±5%)
 * - x̄ = sample mean
 */
export function calculateRequiredSampleSize(
  observations: number[],
  accuracy: number = 0.05,
  confidence: number = 0.95
): number {
  const stats = calculateStatistics(observations);
  if (stats.count < 2 || stats.mean === 0) return 30; // Default minimum

  // Approximate t-value for common confidence levels
  const tValues: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const t = tValues[confidence] || 1.96;

  const n = Math.pow((t * stats.standardDeviation) / (accuracy * stats.mean), 2);

  return Math.max(Math.ceil(n), stats.count);
}

/**
 * Calculate time study results for an element
 */
export function calculateTimeStudy(
  observations: number[],
  rating: WestinghouseRating,
  allowancePercent: number = 15
): TimeStudyResult {
  const statistics = calculateStatistics(observations);
  const observedTime = statistics.mean;

  const ratingFactor = calculateWestinghouseRating(rating);
  const normalTime = observedTime * ratingFactor;

  // Standard time = Normal time × (1 + allowance%)
  const allowanceFactor = 1 + allowancePercent / 100;
  const standardTime = normalTime * allowanceFactor;

  return {
    observedTime,
    normalTime,
    standardTime,
    ratingFactor,
    allowanceFactor,
    statistics,
  };
}

/**
 * Format time in appropriate units
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toFixed(1).padStart(4, "0")} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")} hr`;
  }
}

/**
 * Calculate pieces per hour from standard time
 */
export function calculatePiecesPerHour(standardTimeSeconds: number): number {
  if (standardTimeSeconds <= 0) return 0;
  return 3600 / standardTimeSeconds;
}

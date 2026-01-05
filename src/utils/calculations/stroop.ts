/**
 * Stroop Test Implementation
 * Based on Stroop, J.R. (1935)
 *
 * The Stroop Effect demonstrates interference in reaction time
 * when the color of a word differs from the word's meaning.
 *
 * Three conditions:
 * 1. Congruent: Word matches ink color (RED in red ink)
 * 2. Incongruent: Word differs from ink color (RED in blue ink)
 * 3. Neutral: Non-color word in colored ink (TABLE in red ink)
 */

export const COLORS = {
  red: { name: "RED", hex: "#dc3545", rgb: "rgb(220, 53, 69)" },
  blue: { name: "BLUE", hex: "#0d6efd", rgb: "rgb(13, 110, 253)" },
  green: { name: "GREEN", hex: "#198754", rgb: "rgb(25, 135, 84)" },
  yellow: { name: "YELLOW", hex: "#ffc107", rgb: "rgb(255, 193, 7)" },
} as const;

export type ColorName = keyof typeof COLORS;

export const NEUTRAL_WORDS = ["TABLE", "CHAIR", "HOUSE", "TREE", "BOOK", "DOOR", "LAMP", "DESK"];

export type TrialType = "congruent" | "incongruent" | "neutral";

export interface StroopTrial {
  id: string;
  type: TrialType;
  word: string;
  inkColor: ColorName;
  correctAnswer: ColorName;
  userAnswer: ColorName | null;
  responseTime: number | null; // ms
  correct: boolean | null;
  timestamp: number;
}

export interface StroopResult {
  /** Total trials completed */
  totalTrials: number;
  /** Results by trial type */
  byType: {
    congruent: TypeResult;
    incongruent: TypeResult;
    neutral: TypeResult;
  };
  /** Stroop interference effect (incongruent - congruent RT) */
  interferenceEffect: number;
  /** Facilitation effect (neutral - congruent RT) */
  facilitationEffect: number;
  /** Overall accuracy */
  overallAccuracy: number;
  /** Overall mean RT for correct responses */
  overallMeanRT: number;
  /** Interpretation */
  interpretation: string;
}

export interface TypeResult {
  trials: number;
  correct: number;
  accuracy: number;
  meanRT: number;
  medianRT: number;
  stdRT: number;
  minRT: number;
  maxRT: number;
}

/**
 * Generate a single Stroop trial
 */
export function generateTrial(type: TrialType): Omit<StroopTrial, "id" | "userAnswer" | "responseTime" | "correct" | "timestamp"> {
  const colorNames = Object.keys(COLORS) as ColorName[];

  if (type === "congruent") {
    // Word matches ink color
    const color = colorNames[Math.floor(Math.random() * colorNames.length)];
    return {
      type,
      word: COLORS[color].name,
      inkColor: color,
      correctAnswer: color,
    };
  } else if (type === "incongruent") {
    // Word differs from ink color
    const wordColor = colorNames[Math.floor(Math.random() * colorNames.length)];
    let inkColor = colorNames[Math.floor(Math.random() * colorNames.length)];
    while (inkColor === wordColor) {
      inkColor = colorNames[Math.floor(Math.random() * colorNames.length)];
    }
    return {
      type,
      word: COLORS[wordColor].name,
      inkColor,
      correctAnswer: inkColor,
    };
  } else {
    // Neutral: non-color word
    const word = NEUTRAL_WORDS[Math.floor(Math.random() * NEUTRAL_WORDS.length)];
    const inkColor = colorNames[Math.floor(Math.random() * colorNames.length)];
    return {
      type,
      word,
      inkColor,
      correctAnswer: inkColor,
    };
  }
}

/**
 * Generate a balanced set of trials
 */
export function generateTrialSet(trialsPerType: number = 10): StroopTrial[] {
  const trials: StroopTrial[] = [];
  const types: TrialType[] = ["congruent", "incongruent", "neutral"];

  for (const type of types) {
    for (let i = 0; i < trialsPerType; i++) {
      const trial = generateTrial(type);
      trials.push({
        ...trial,
        id: `${type}-${i}`,
        userAnswer: null,
        responseTime: null,
        correct: null,
        timestamp: 0,
      });
    }
  }

  // Shuffle trials
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trials[i], trials[j]] = [trials[j], trials[i]];
  }

  return trials;
}

/**
 * Calculate statistics for a set of response times
 */
function calculateRTStats(responseTimes: number[]): Omit<TypeResult, "trials" | "correct" | "accuracy"> {
  if (responseTimes.length === 0) {
    return { meanRT: 0, medianRT: 0, stdRT: 0, minRT: 0, maxRT: 0 };
  }

  const sorted = [...responseTimes].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = sorted.reduce((a, x) => a + Math.pow(x - mean, 2), 0) / (n - 1 || 1);
  const std = Math.sqrt(variance);

  return {
    meanRT: mean,
    medianRT: median,
    stdRT: std,
    minRT: sorted[0],
    maxRT: sorted[n - 1],
  };
}

/**
 * Analyze completed Stroop trials
 */
export function analyzeResults(trials: StroopTrial[]): StroopResult {
  const completedTrials = trials.filter((t) => t.responseTime !== null && t.correct !== null);

  const byType: StroopResult["byType"] = {
    congruent: { trials: 0, correct: 0, accuracy: 0, meanRT: 0, medianRT: 0, stdRT: 0, minRT: 0, maxRT: 0 },
    incongruent: { trials: 0, correct: 0, accuracy: 0, meanRT: 0, medianRT: 0, stdRT: 0, minRT: 0, maxRT: 0 },
    neutral: { trials: 0, correct: 0, accuracy: 0, meanRT: 0, medianRT: 0, stdRT: 0, minRT: 0, maxRT: 0 },
  };

  for (const type of ["congruent", "incongruent", "neutral"] as TrialType[]) {
    const typeTrials = completedTrials.filter((t) => t.type === type);
    const correctTrials = typeTrials.filter((t) => t.correct);
    const correctRTs = correctTrials.map((t) => t.responseTime!);

    byType[type] = {
      trials: typeTrials.length,
      correct: correctTrials.length,
      accuracy: typeTrials.length > 0 ? (correctTrials.length / typeTrials.length) * 100 : 0,
      ...calculateRTStats(correctRTs),
    };
  }

  // Stroop interference effect
  const interferenceEffect = byType.incongruent.meanRT - byType.congruent.meanRT;

  // Facilitation effect
  const facilitationEffect = byType.neutral.meanRT - byType.congruent.meanRT;

  // Overall stats
  const allCorrect = completedTrials.filter((t) => t.correct);
  const overallAccuracy = completedTrials.length > 0 ? (allCorrect.length / completedTrials.length) * 100 : 0;
  const overallMeanRT = allCorrect.length > 0 ? allCorrect.reduce((a, t) => a + t.responseTime!, 0) / allCorrect.length : 0;

  // Interpretation
  let interpretation = "";
  if (interferenceEffect > 100) {
    interpretation = `Strong Stroop interference effect (${interferenceEffect.toFixed(0)}ms). `;
    interpretation += "Incongruent trials took significantly longer, demonstrating classic cognitive interference.";
  } else if (interferenceEffect > 50) {
    interpretation = `Moderate Stroop interference effect (${interferenceEffect.toFixed(0)}ms). `;
    interpretation += "The expected pattern of slower responses for incongruent trials is present.";
  } else if (interferenceEffect > 0) {
    interpretation = `Mild Stroop interference effect (${interferenceEffect.toFixed(0)}ms). `;
    interpretation += "Some interference is present but less than typically observed.";
  } else {
    interpretation = "No Stroop interference effect detected. This is unusual and may indicate practice effects or response strategy.";
  }

  return {
    totalTrials: completedTrials.length,
    byType,
    interferenceEffect,
    facilitationEffect,
    overallAccuracy,
    overallMeanRT,
    interpretation,
  };
}

/**
 * Get keyboard key for a color
 */
export function getColorKey(color: ColorName): string {
  const keys: Record<ColorName, string> = {
    red: "R",
    blue: "B",
    green: "G",
    yellow: "Y",
  };
  return keys[color];
}

/**
 * Get color from keyboard key
 */
export function getColorFromKey(key: string): ColorName | null {
  const upperKey = key.toUpperCase();
  const mapping: Record<string, ColorName> = {
    R: "red",
    B: "blue",
    G: "green",
    Y: "yellow",
  };
  return mapping[upperKey] || null;
}

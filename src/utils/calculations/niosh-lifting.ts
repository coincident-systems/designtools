/**
 * NIOSH Lifting Equation Calculator
 * Based on the 1991 NIOSH Revised Lifting Equation
 *
 * RWL = LC × HM × VM × DM × AM × FM × CM
 *
 * Where:
 * - LC = Load Constant (23 kg or 51 lb)
 * - HM = Horizontal Multiplier
 * - VM = Vertical Multiplier
 * - DM = Distance Multiplier
 * - AM = Asymmetric Multiplier
 * - FM = Frequency Multiplier
 * - CM = Coupling Multiplier
 *
 * Lifting Index (LI) = Load Weight / RWL
 * - LI ≤ 1.0: Acceptable
 * - 1.0 < LI ≤ 3.0: Increased risk
 * - LI > 3.0: High risk
 */

// Load constant in kg (can convert to lb)
export const LC_KG = 23;
export const LC_LB = 51;

export type Unit = "metric" | "imperial";

export interface NIOSHInputs {
  /** Horizontal distance from midpoint between ankles to hands (cm or in) */
  horizontalDistance: number;
  /** Vertical height of hands from floor at origin (cm or in) */
  verticalDistance: number;
  /** Vertical travel distance (cm or in) */
  travelDistance: number;
  /** Asymmetric angle in degrees (0-135) */
  asymmetricAngle: number;
  /** Lifting frequency (lifts per minute) */
  frequency: number;
  /** Duration category */
  duration: "short" | "moderate" | "long";
  /** Coupling quality */
  coupling: "good" | "fair" | "poor";
  /** Actual load weight (kg or lb) */
  loadWeight: number;
  /** Unit system */
  unit: Unit;
}

export interface NIOSHResult {
  rwl: number;
  liftingIndex: number;
  riskLevel: "acceptable" | "increased" | "high";
  riskDescription: string;
  multipliers: {
    hm: number;
    vm: number;
    dm: number;
    am: number;
    fm: number;
    cm: number;
  };
  limitingFactor: string;
}

/**
 * Calculate Horizontal Multiplier (HM)
 * HM = 25/H (metric) or 10/H (imperial)
 * Valid range: 25-63 cm or 10-25 in
 */
export function calculateHM(h: number, unit: Unit): number {
  const minH = unit === "metric" ? 25 : 10;
  const maxH = unit === "metric" ? 63 : 25;
  const factor = unit === "metric" ? 25 : 10;

  if (h < minH) h = minH;
  if (h > maxH) return 0;

  return Math.min(1, factor / h);
}

/**
 * Calculate Vertical Multiplier (VM)
 * VM = 1 - 0.003|V - 75| (metric) or 1 - 0.0075|V - 30| (imperial)
 * Valid range: 0-175 cm or 0-70 in
 */
export function calculateVM(v: number, unit: Unit): number {
  const optimalV = unit === "metric" ? 75 : 30;
  const factor = unit === "metric" ? 0.003 : 0.0075;
  const maxV = unit === "metric" ? 175 : 70;

  if (v < 0) v = 0;
  if (v > maxV) return 0;

  return Math.max(0, 1 - factor * Math.abs(v - optimalV));
}

/**
 * Calculate Distance Multiplier (DM)
 * DM = 0.82 + 4.5/D (metric) or 0.82 + 1.8/D (imperial)
 * Valid range: 25-175 cm or 10-70 in (minimum 25cm/10in)
 */
export function calculateDM(d: number, unit: Unit): number {
  const minD = unit === "metric" ? 25 : 10;
  const factor = unit === "metric" ? 4.5 : 1.8;

  if (d < minD) d = minD;

  return Math.min(1, 0.82 + factor / d);
}

/**
 * Calculate Asymmetric Multiplier (AM)
 * AM = 1 - 0.0032A
 * Valid range: 0-135 degrees
 */
export function calculateAM(a: number): number {
  if (a < 0) a = 0;
  if (a > 135) return 0;

  return 1 - 0.0032 * a;
}

/**
 * Frequency Multiplier lookup table
 * Based on frequency (lifts/min), duration, and vertical location
 */
const FM_TABLE: Record<string, Record<number, number>> = {
  // Duration: short (≤1 hr), V < 75cm
  "short-low": {
    0.2: 1.0, 0.5: 0.97, 1: 0.94, 2: 0.91, 3: 0.88, 4: 0.84,
    5: 0.8, 6: 0.75, 7: 0.7, 8: 0.6, 9: 0.52, 10: 0.45,
    11: 0.41, 12: 0.37, 13: 0.34, 14: 0.31, 15: 0.28,
  },
  // Duration: short (≤1 hr), V ≥ 75cm
  "short-high": {
    0.2: 1.0, 0.5: 0.97, 1: 0.94, 2: 0.91, 3: 0.88, 4: 0.84,
    5: 0.8, 6: 0.75, 7: 0.7, 8: 0.6, 9: 0.52, 10: 0.45,
    11: 0.41, 12: 0.37, 13: 0.00, 14: 0.00, 15: 0.00,
  },
  // Duration: moderate (1-2 hr), V < 75cm
  "moderate-low": {
    0.2: 0.95, 0.5: 0.92, 1: 0.88, 2: 0.84, 3: 0.79, 4: 0.72,
    5: 0.6, 6: 0.5, 7: 0.42, 8: 0.35, 9: 0.3, 10: 0.26,
    11: 0.23, 12: 0.21, 13: 0.00, 14: 0.00, 15: 0.00,
  },
  // Duration: moderate (1-2 hr), V ≥ 75cm
  "moderate-high": {
    0.2: 0.95, 0.5: 0.92, 1: 0.88, 2: 0.84, 3: 0.79, 4: 0.72,
    5: 0.6, 6: 0.5, 7: 0.42, 8: 0.35, 9: 0.3, 10: 0.26,
    11: 0.00, 12: 0.00, 13: 0.00, 14: 0.00, 15: 0.00,
  },
  // Duration: long (2-8 hr), V < 75cm
  "long-low": {
    0.2: 0.85, 0.5: 0.81, 1: 0.75, 2: 0.65, 3: 0.55, 4: 0.45,
    5: 0.35, 6: 0.27, 7: 0.22, 8: 0.18, 9: 0.00, 10: 0.00,
    11: 0.00, 12: 0.00, 13: 0.00, 14: 0.00, 15: 0.00,
  },
  // Duration: long (2-8 hr), V ≥ 75cm
  "long-high": {
    0.2: 0.85, 0.5: 0.81, 1: 0.75, 2: 0.65, 3: 0.55, 4: 0.45,
    5: 0.35, 6: 0.27, 7: 0.22, 8: 0.00, 9: 0.00, 10: 0.00,
    11: 0.00, 12: 0.00, 13: 0.00, 14: 0.00, 15: 0.00,
  },
};

/**
 * Calculate Frequency Multiplier (FM)
 */
export function calculateFM(
  frequency: number,
  duration: "short" | "moderate" | "long",
  verticalLocation: number,
  unit: Unit
): number {
  const threshold = unit === "metric" ? 75 : 30;
  const vPosition = verticalLocation >= threshold ? "high" : "low";
  const key = `${duration}-${vPosition}`;
  const table = FM_TABLE[key];

  // Find closest frequency in table
  const frequencies = Object.keys(table).map(Number).sort((a, b) => a - b);

  if (frequency <= frequencies[0]) return table[frequencies[0]];
  if (frequency >= frequencies[frequencies.length - 1]) {
    return table[frequencies[frequencies.length - 1]];
  }

  // Linear interpolation
  for (let i = 0; i < frequencies.length - 1; i++) {
    if (frequency >= frequencies[i] && frequency <= frequencies[i + 1]) {
      const f1 = frequencies[i];
      const f2 = frequencies[i + 1];
      const v1 = table[f1];
      const v2 = table[f2];
      return v1 + ((frequency - f1) / (f2 - f1)) * (v2 - v1);
    }
  }

  return 0;
}

/**
 * Coupling Multiplier lookup
 */
export function calculateCM(
  coupling: "good" | "fair" | "poor",
  verticalLocation: number,
  unit: Unit
): number {
  const threshold = unit === "metric" ? 75 : 30;
  const isHigh = verticalLocation >= threshold;

  const cmTable: Record<string, { low: number; high: number }> = {
    good: { low: 1.0, high: 1.0 },
    fair: { low: 0.95, high: 1.0 },
    poor: { low: 0.9, high: 0.9 },
  };

  return isHigh ? cmTable[coupling].high : cmTable[coupling].low;
}

/**
 * Calculate the Recommended Weight Limit (RWL) and Lifting Index (LI)
 */
export function calculateNIOSH(inputs: NIOSHInputs): NIOSHResult {
  const lc = inputs.unit === "metric" ? LC_KG : LC_LB;

  const hm = calculateHM(inputs.horizontalDistance, inputs.unit);
  const vm = calculateVM(inputs.verticalDistance, inputs.unit);
  const dm = calculateDM(inputs.travelDistance, inputs.unit);
  const am = calculateAM(inputs.asymmetricAngle);
  const fm = calculateFM(
    inputs.frequency,
    inputs.duration,
    inputs.verticalDistance,
    inputs.unit
  );
  const cm = calculateCM(inputs.coupling, inputs.verticalDistance, inputs.unit);

  const multipliers = { hm, vm, dm, am, fm, cm };

  // Calculate RWL
  const rwl = lc * hm * vm * dm * am * fm * cm;

  // Calculate Lifting Index
  const liftingIndex = inputs.loadWeight / rwl;

  // Determine risk level
  let riskLevel: "acceptable" | "increased" | "high";
  let riskDescription: string;

  if (liftingIndex <= 1.0) {
    riskLevel = "acceptable";
    riskDescription = "Task poses minimal risk to most workers";
  } else if (liftingIndex <= 3.0) {
    riskLevel = "increased";
    riskDescription = "Task may pose increased risk; consider redesign";
  } else {
    riskLevel = "high";
    riskDescription = "Task poses significant risk; redesign required";
  }

  // Find limiting factor (lowest multiplier)
  const multiplierEntries = Object.entries(multipliers) as [string, number][];
  const minMultiplier = multiplierEntries.reduce((min, curr) =>
    curr[1] < min[1] ? curr : min
  );

  const factorNames: Record<string, string> = {
    hm: "Horizontal distance",
    vm: "Vertical location",
    dm: "Travel distance",
    am: "Asymmetric angle",
    fm: "Frequency",
    cm: "Coupling",
  };

  return {
    rwl,
    liftingIndex,
    riskLevel,
    riskDescription,
    multipliers,
    limitingFactor: factorNames[minMultiplier[0]],
  };
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: Unit): string {
  return `${weight.toFixed(1)} ${unit === "metric" ? "kg" : "lb"}`;
}

/**
 * Format distance with unit
 */
export function formatDistance(distance: number, unit: Unit): string {
  return `${distance.toFixed(1)} ${unit === "metric" ? "cm" : "in"}`;
}

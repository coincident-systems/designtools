/**
 * OSHA Noise Dose Calculations
 *
 * Based on OSHA 29 CFR 1910.95 - Occupational Noise Exposure
 *
 * The OSHA Permissible Exposure Limit (PEL) is:
 * - 90 dB(A) for 8 hours
 * - For every 5 dB increase, allowed time is halved (5 dB exchange rate)
 *
 * Noise Dose = sum of (actual exposure / allowed time) × 100%
 * TWA = 16.61 × log10(Dose/100) + 90
 */

export interface NoiseExposure {
  /** Noise level in dB(A) */
  level: number;
  /** Duration of exposure in hours */
  duration: number;
}

export interface NoiseDoseResult {
  /** Total noise dose as percentage (100% = PEL) */
  dose: number;
  /** Time-weighted average in dB(A) */
  twa: number;
  /** Individual exposure calculations */
  exposures: Array<{
    level: number;
    actualDuration: number;
    allowedDuration: number;
    partialDose: number;
  }>;
  /** Whether exposure exceeds OSHA PEL */
  exceedsPEL: boolean;
  /** Whether exposure exceeds OSHA Action Level (50%) */
  exceedsActionLevel: boolean;
}

/** OSHA reference level (dB) */
export const OSHA_REFERENCE_LEVEL = 90;

/** OSHA maximum allowed time at reference level (hours) */
export const OSHA_REFERENCE_TIME = 8;

/** OSHA exchange rate (dB) - time halves for each increment */
export const OSHA_EXCHANGE_RATE = 5;

/** Minimum noise level for OSHA consideration (dB) */
export const OSHA_THRESHOLD = 80;

/** Maximum noise level in OSHA table (dB) */
export const OSHA_MAX_LEVEL = 130;

/**
 * Calculate the allowed exposure time for a given noise level.
 * Uses the OSHA formula: T = 8 / 2^((L-90)/5)
 *
 * @param level Noise level in dB(A)
 * @returns Allowed exposure time in hours
 * @throws Error if level is below threshold or above maximum
 */
export function calculateAllowedTime(level: number): number {
  if (level < OSHA_THRESHOLD) {
    throw new Error(`Noise level must be at least ${OSHA_THRESHOLD} dB`);
  }
  if (level > OSHA_MAX_LEVEL) {
    throw new Error(`Noise level must not exceed ${OSHA_MAX_LEVEL} dB`);
  }

  // T = 8 / 2^((L-90)/5)
  const exponent = (level - OSHA_REFERENCE_LEVEL) / OSHA_EXCHANGE_RATE;
  return OSHA_REFERENCE_TIME / Math.pow(2, exponent);
}

/**
 * Calculate the noise level for a given allowed time.
 * Inverse of calculateAllowedTime.
 *
 * @param hours Allowed exposure time in hours
 * @returns Noise level in dB(A)
 */
export function calculateLevelFromTime(hours: number): number {
  if (hours <= 0) {
    throw new Error("Time must be positive");
  }
  // L = 90 + 5 × log2(8/T)
  return OSHA_REFERENCE_LEVEL + OSHA_EXCHANGE_RATE * Math.log2(OSHA_REFERENCE_TIME / hours);
}

/**
 * Calculate the OSHA noise dose from a set of noise exposures.
 *
 * Dose = Σ(C/T) × 100%
 * where C = actual exposure time, T = allowed time at that level
 *
 * @param exposures Array of noise exposure data
 * @returns Complete noise dose calculation result
 */
export function calculateNoiseDose(exposures: NoiseExposure[]): NoiseDoseResult {
  // Validate inputs
  if (exposures.length === 0) {
    throw new Error("At least one exposure is required");
  }

  // Filter out empty entries and validate
  const validExposures = exposures.filter((e) => e.duration > 0);

  if (validExposures.length === 0) {
    throw new Error("At least one exposure with duration > 0 is required");
  }

  // Calculate individual exposures and sum for total dose
  const exposureResults = validExposures.map((exposure) => {
    if (exposure.level < OSHA_THRESHOLD) {
      // Below threshold, no contribution to dose
      return {
        level: exposure.level,
        actualDuration: exposure.duration,
        allowedDuration: Infinity,
        partialDose: 0,
      };
    }

    if (exposure.level > OSHA_MAX_LEVEL) {
      throw new Error(`Noise level ${exposure.level} dB exceeds maximum ${OSHA_MAX_LEVEL} dB`);
    }

    const allowedDuration = calculateAllowedTime(exposure.level);
    const partialDose = (exposure.duration / allowedDuration) * 100;

    return {
      level: exposure.level,
      actualDuration: exposure.duration,
      allowedDuration,
      partialDose,
    };
  });

  // Sum all partial doses
  const totalDose = exposureResults.reduce((sum, exp) => sum + exp.partialDose, 0);

  // Calculate TWA (Time-Weighted Average)
  // TWA = 16.61 × log10(Dose/100) + 90
  // Handle edge case where dose is 0
  let twa = 0;
  if (totalDose > 0) {
    twa = 16.61 * Math.log10(totalDose / 100) + OSHA_REFERENCE_LEVEL;
  }

  return {
    dose: totalDose,
    twa,
    exposures: exposureResults,
    exceedsPEL: totalDose > 100,
    exceedsActionLevel: totalDose > 50,
  };
}

/**
 * Calculate TWA from total noise dose.
 *
 * @param dose Total noise dose as percentage
 * @returns TWA in dB(A)
 */
export function calculateTWA(dose: number): number {
  if (dose <= 0) {
    return 0;
  }
  return 16.61 * Math.log10(dose / 100) + OSHA_REFERENCE_LEVEL;
}

/**
 * Calculate noise dose from TWA.
 *
 * @param twa Time-weighted average in dB(A)
 * @returns Dose as percentage
 */
export function calculateDoseFromTWA(twa: number): number {
  // Dose = 100 × 10^((TWA-90)/16.61)
  return 100 * Math.pow(10, (twa - OSHA_REFERENCE_LEVEL) / 16.61);
}

/**
 * OSHA reference table for permissible noise exposure.
 * Based on Table G-16 in 29 CFR 1910.95.
 */
export const OSHA_PERMISSIBLE_EXPOSURES = [
  { level: 90, duration: 8 },
  { level: 92, duration: 6 },
  { level: 95, duration: 4 },
  { level: 97, duration: 3 },
  { level: 100, duration: 2 },
  { level: 102, duration: 1.5 },
  { level: 105, duration: 1 },
  { level: 110, duration: 0.5 },
  { level: 115, duration: 0.25 },
] as const;

/**
 * Format noise dose as percentage string.
 */
export function formatDose(dose: number): string {
  return `${dose.toFixed(1)}%`;
}

/**
 * Format noise level in dB.
 */
export function formatLevel(level: number): string {
  return `${level.toFixed(0)} dB(A)`;
}

/**
 * Format duration in hours and minutes.
 */
export function formatDuration(hours: number): string {
  if (hours >= 8) {
    return `${hours.toFixed(1)} hrs`;
  }
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) {
    return `${m} min`;
  }
  if (m === 0) {
    return `${h} hr`;
  }
  return `${h} hr ${m} min`;
}

/**
 * Get risk level description based on dose.
 */
export function getRiskLevel(dose: number): {
  level: "safe" | "action" | "exceeded";
  description: string;
} {
  if (dose > 100) {
    return {
      level: "exceeded",
      description: "Exceeds OSHA PEL - Immediate engineering controls required",
    };
  }
  if (dose > 50) {
    return {
      level: "action",
      description: "Exceeds Action Level - Hearing conservation program required",
    };
  }
  return {
    level: "safe",
    description: "Below OSHA Action Level",
  };
}

import { describe, it, expect } from "vitest";
import {
  calculateAllowedTime,
  calculateLevelFromTime,
  calculateNoiseDose,
  calculateTWA,
  calculateDoseFromTWA,
  formatDose,
  formatLevel,
  formatDuration,
  getRiskLevel,
  OSHA_PERMISSIBLE_EXPOSURES,
  OSHA_REFERENCE_LEVEL,
  OSHA_REFERENCE_TIME,
  OSHA_THRESHOLD,
  OSHA_MAX_LEVEL,
} from "./noise-dose";

describe("Noise Dose Calculations", () => {
  describe("calculateAllowedTime", () => {
    it("returns 8 hours for 90 dB (OSHA reference)", () => {
      expect(calculateAllowedTime(90)).toBe(8);
    });

    it("returns 4 hours for 95 dB (5 dB increase = half time)", () => {
      expect(calculateAllowedTime(95)).toBeCloseTo(4, 2);
    });

    it("returns 2 hours for 100 dB", () => {
      expect(calculateAllowedTime(100)).toBeCloseTo(2, 2);
    });

    it("returns 1 hour for 105 dB", () => {
      expect(calculateAllowedTime(105)).toBeCloseTo(1, 2);
    });

    it("returns 0.5 hours for 110 dB", () => {
      expect(calculateAllowedTime(110)).toBeCloseTo(0.5, 2);
    });

    it("returns 16 hours for 85 dB (5 dB decrease = double time)", () => {
      expect(calculateAllowedTime(85)).toBeCloseTo(16, 2);
    });

    it("matches OSHA reference table values", () => {
      OSHA_PERMISSIBLE_EXPOSURES.forEach(({ level, duration }) => {
        // OSHA table values are rounded, so use lower precision
        expect(calculateAllowedTime(level)).toBeCloseTo(duration, 0);
      });
    });

    it("throws error for level below threshold", () => {
      expect(() => calculateAllowedTime(79)).toThrow(
        `Noise level must be at least ${OSHA_THRESHOLD} dB`
      );
    });

    it("throws error for level above maximum", () => {
      expect(() => calculateAllowedTime(131)).toThrow(
        `Noise level must not exceed ${OSHA_MAX_LEVEL} dB`
      );
    });
  });

  describe("calculateLevelFromTime", () => {
    it("returns 90 dB for 8 hours", () => {
      expect(calculateLevelFromTime(8)).toBe(90);
    });

    it("returns 95 dB for 4 hours", () => {
      expect(calculateLevelFromTime(4)).toBeCloseTo(95, 1);
    });

    it("returns 100 dB for 2 hours", () => {
      expect(calculateLevelFromTime(2)).toBeCloseTo(100, 1);
    });

    it("returns 85 dB for 16 hours", () => {
      expect(calculateLevelFromTime(16)).toBeCloseTo(85, 1);
    });

    it("is inverse of calculateAllowedTime", () => {
      for (let level = 80; level <= 115; level += 5) {
        const time = calculateAllowedTime(level);
        expect(calculateLevelFromTime(time)).toBeCloseTo(level, 5);
      }
    });

    it("throws error for non-positive time", () => {
      expect(() => calculateLevelFromTime(0)).toThrow("Time must be positive");
      expect(() => calculateLevelFromTime(-1)).toThrow("Time must be positive");
    });
  });

  describe("calculateNoiseDose", () => {
    it("calculates 100% dose for exactly 8 hours at 90 dB", () => {
      const result = calculateNoiseDose([{ level: 90, duration: 8 }]);
      expect(result.dose).toBeCloseTo(100, 1);
      expect(result.exceedsPEL).toBe(false);
    });

    it("calculates 50% dose for 4 hours at 90 dB", () => {
      const result = calculateNoiseDose([{ level: 90, duration: 4 }]);
      expect(result.dose).toBeCloseTo(50, 1);
      expect(result.exceedsActionLevel).toBe(false);
    });

    it("calculates 100% dose for 4 hours at 95 dB", () => {
      const result = calculateNoiseDose([{ level: 95, duration: 4 }]);
      expect(result.dose).toBeCloseTo(100, 1);
    });

    it("calculates cumulative dose for multiple exposures", () => {
      // 4 hours at 90 dB = 50% + 2 hours at 95 dB = 50% = 100%
      const result = calculateNoiseDose([
        { level: 90, duration: 4 },
        { level: 95, duration: 2 },
      ]);
      expect(result.dose).toBeCloseTo(100, 1);
    });

    it("detects when PEL is exceeded", () => {
      const result = calculateNoiseDose([{ level: 95, duration: 6 }]);
      expect(result.exceedsPEL).toBe(true);
      expect(result.dose).toBeGreaterThan(100);
    });

    it("detects action level (50%) threshold", () => {
      const result = calculateNoiseDose([{ level: 90, duration: 4.5 }]);
      expect(result.exceedsActionLevel).toBe(true);
      expect(result.exceedsPEL).toBe(false);
    });

    it("ignores exposures below threshold", () => {
      const result = calculateNoiseDose([
        { level: 75, duration: 8 },
        { level: 90, duration: 4 },
      ]);
      // Only 90 dB exposure contributes
      expect(result.dose).toBeCloseTo(50, 1);
    });

    it("calculates TWA correctly", () => {
      // 100% dose = TWA of 90 dB
      const result100 = calculateNoiseDose([{ level: 90, duration: 8 }]);
      expect(result100.twa).toBeCloseTo(90, 1);

      // 50% dose = TWA of approximately 85 dB
      const result50 = calculateNoiseDose([{ level: 90, duration: 4 }]);
      expect(result50.twa).toBeCloseTo(85, 1);
    });

    it("throws error for empty exposures", () => {
      expect(() => calculateNoiseDose([])).toThrow("At least one exposure is required");
    });

    it("throws error for all zero durations", () => {
      expect(() => calculateNoiseDose([{ level: 90, duration: 0 }])).toThrow(
        "At least one exposure with duration > 0 is required"
      );
    });

    it("throws error for noise level exceeding maximum", () => {
      expect(() => calculateNoiseDose([{ level: 140, duration: 1 }])).toThrow(
        "Noise level 140 dB exceeds maximum"
      );
    });

    it("returns detailed exposure breakdown", () => {
      const result = calculateNoiseDose([
        { level: 90, duration: 4 },
        { level: 100, duration: 1 },
      ]);

      expect(result.exposures).toHaveLength(2);
      expect(result.exposures[0]).toMatchObject({
        level: 90,
        actualDuration: 4,
        allowedDuration: 8,
      });
      expect(result.exposures[0].partialDose).toBeCloseTo(50, 1);
    });
  });

  describe("calculateTWA", () => {
    it("returns 90 dB for 100% dose", () => {
      expect(calculateTWA(100)).toBeCloseTo(90, 1);
    });

    it("returns approximately 85 dB for 50% dose", () => {
      expect(calculateTWA(50)).toBeCloseTo(85, 1);
    });

    it("returns approximately 95 dB for 200% dose", () => {
      expect(calculateTWA(200)).toBeCloseTo(95, 1);
    });

    it("returns 0 for 0% dose", () => {
      expect(calculateTWA(0)).toBe(0);
    });
  });

  describe("calculateDoseFromTWA", () => {
    it("returns 100% for 90 dB TWA", () => {
      expect(calculateDoseFromTWA(90)).toBeCloseTo(100, 1);
    });

    it("returns approximately 50% for 85 dB TWA", () => {
      expect(calculateDoseFromTWA(85)).toBeCloseTo(50, 1);
    });

    it("is inverse of calculateTWA", () => {
      for (const dose of [25, 50, 100, 150, 200]) {
        const twa = calculateTWA(dose);
        expect(calculateDoseFromTWA(twa)).toBeCloseTo(dose, 1);
      }
    });
  });

  describe("formatDose", () => {
    it("formats dose as percentage", () => {
      expect(formatDose(100)).toBe("100.0%");
      expect(formatDose(50.5)).toBe("50.5%");
      expect(formatDose(125.678)).toBe("125.7%");
    });
  });

  describe("formatLevel", () => {
    it("formats level in dB(A)", () => {
      expect(formatLevel(90)).toBe("90 dB(A)");
      expect(formatLevel(95.4)).toBe("95 dB(A)");
    });
  });

  describe("formatDuration", () => {
    it("formats hours for 8+ hours", () => {
      expect(formatDuration(8)).toBe("8.0 hrs");
      expect(formatDuration(10.5)).toBe("10.5 hrs");
    });

    it("formats hours and minutes for shorter durations", () => {
      expect(formatDuration(1.5)).toBe("1 hr 30 min");
      expect(formatDuration(0.5)).toBe("30 min");
      expect(formatDuration(2)).toBe("2 hr");
    });
  });

  describe("getRiskLevel", () => {
    it("returns 'safe' for dose under 50%", () => {
      expect(getRiskLevel(49).level).toBe("safe");
      expect(getRiskLevel(25).level).toBe("safe");
    });

    it("returns 'action' for dose 50-100%", () => {
      expect(getRiskLevel(50.1).level).toBe("action");
      expect(getRiskLevel(75).level).toBe("action");
      expect(getRiskLevel(100).level).toBe("action");
    });

    it("returns 'exceeded' for dose over 100%", () => {
      expect(getRiskLevel(100.1).level).toBe("exceeded");
      expect(getRiskLevel(150).level).toBe("exceeded");
    });

    it("includes description with risk level", () => {
      expect(getRiskLevel(25).description).toContain("Below");
      expect(getRiskLevel(75).description).toContain("Action Level");
      expect(getRiskLevel(150).description).toContain("Exceeds OSHA PEL");
    });
  });

  describe("OSHA constants", () => {
    it("defines correct reference values", () => {
      expect(OSHA_REFERENCE_LEVEL).toBe(90);
      expect(OSHA_REFERENCE_TIME).toBe(8);
      expect(OSHA_THRESHOLD).toBe(80);
      expect(OSHA_MAX_LEVEL).toBe(130);
    });

    it("OSHA_PERMISSIBLE_EXPOSURES table is consistent", () => {
      OSHA_PERMISSIBLE_EXPOSURES.forEach(({ level, duration }) => {
        const calculated = calculateAllowedTime(level);
        // OSHA table values are rounded, so use lower precision
        expect(calculated).toBeCloseTo(duration, 0);
      });
    });
  });
});

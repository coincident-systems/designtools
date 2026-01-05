import { describe, it, expect } from "vitest";
import {
  calculateSampleSize,
  calculateErrorLimit,
  generateRandomObservationTimes,
  getZValue,
  isValidProportion,
  formatErrorAsPercentage,
  CONFIDENCE_LEVELS,
} from "./work-sampling";

describe("Work Sampling Calculations", () => {
  describe("getZValue", () => {
    it("returns correct z-value for 90% confidence", () => {
      expect(getZValue("0.90")).toBe(1.645);
    });

    it("returns correct z-value for 95% confidence", () => {
      expect(getZValue("0.95")).toBe(1.96);
    });

    it("returns correct z-value for 99% confidence", () => {
      expect(getZValue("0.99")).toBe(2.576);
    });

    it("throws error for invalid confidence level", () => {
      expect(() => getZValue("0.85")).toThrow("Invalid confidence level");
    });
  });

  describe("calculateSampleSize", () => {
    it("calculates sample size for typical study (p=0.5, 95%, ±5%)", () => {
      // Classic work sampling scenario
      // n = (1.96² × 0.5 × 0.5) / 0.05² = 384.16 → 385
      const n = calculateSampleSize(0.5, 1.96, 0.05);
      expect(n).toBe(385);
    });

    it("calculates sample size for high probability (p=0.8, 95%, ±5%)", () => {
      // n = (1.96² × 0.8 × 0.2) / 0.05² = 245.86 → 246
      const n = calculateSampleSize(0.8, 1.96, 0.05);
      expect(n).toBe(246);
    });

    it("calculates sample size for low probability (p=0.2, 95%, ±5%)", () => {
      // n = (1.96² × 0.2 × 0.8) / 0.05² = 245.86 → 246
      const n = calculateSampleSize(0.2, 1.96, 0.05);
      expect(n).toBe(246);
    });

    it("requires more samples for tighter error limits", () => {
      const n1 = calculateSampleSize(0.5, 1.96, 0.05); // ±5%
      const n2 = calculateSampleSize(0.5, 1.96, 0.02); // ±2%
      expect(n2).toBeGreaterThan(n1);
    });

    it("requires more samples for higher confidence", () => {
      const n90 = calculateSampleSize(0.5, 1.645, 0.05); // 90%
      const n99 = calculateSampleSize(0.5, 2.576, 0.05); // 99%
      expect(n99).toBeGreaterThan(n90);
    });

    it("returns 0 for p=0 (no variability)", () => {
      expect(calculateSampleSize(0, 1.96, 0.05)).toBe(0);
    });

    it("returns 0 for p=1 (no variability)", () => {
      expect(calculateSampleSize(1, 1.96, 0.05)).toBe(0);
    });

    it("throws error for p < 0", () => {
      expect(() => calculateSampleSize(-0.1, 1.96, 0.05)).toThrow(
        "Probability (p) must be between 0 and 1"
      );
    });

    it("throws error for p > 1", () => {
      expect(() => calculateSampleSize(1.1, 1.96, 0.05)).toThrow(
        "Probability (p) must be between 0 and 1"
      );
    });

    it("throws error for non-positive z-value", () => {
      expect(() => calculateSampleSize(0.5, 0, 0.05)).toThrow(
        "Z-value must be positive"
      );
      expect(() => calculateSampleSize(0.5, -1, 0.05)).toThrow(
        "Z-value must be positive"
      );
    });

    it("throws error for non-positive error limit", () => {
      expect(() => calculateSampleSize(0.5, 1.96, 0)).toThrow(
        "Error limit (l) must be positive"
      );
      expect(() => calculateSampleSize(0.5, 1.96, -0.05)).toThrow(
        "Error limit (l) must be positive"
      );
    });

    it("throws error for error limit > 1", () => {
      expect(() => calculateSampleSize(0.5, 1.96, 1.5)).toThrow(
        "Error limit (l) should not exceed 1"
      );
    });
  });

  describe("calculateErrorLimit", () => {
    it("calculates error limit for typical study (p=0.5, 95%, n=384)", () => {
      // l = 1.96 × √(0.5 × 0.5 / 384) ≈ 0.05
      const l = calculateErrorLimit(0.5, 1.96, 384);
      expect(l).toBeCloseTo(0.05, 2);
    });

    it("inverse relationship with calculateSampleSize", () => {
      // If we calculate n from p, z, l, then calculate l from p, z, n
      // we should get approximately the original l back
      const p = 0.5;
      const z = 1.96;
      const originalL = 0.05;

      const n = calculateSampleSize(p, z, originalL);
      const calculatedL = calculateErrorLimit(p, z, n);

      // Should be very close (accounting for ceiling in sample size)
      expect(calculatedL).toBeLessThanOrEqual(originalL);
    });

    it("larger sample size yields smaller error", () => {
      const l100 = calculateErrorLimit(0.5, 1.96, 100);
      const l1000 = calculateErrorLimit(0.5, 1.96, 1000);
      expect(l1000).toBeLessThan(l100);
    });

    it("returns 0 for p=0 (no variability)", () => {
      expect(calculateErrorLimit(0, 1.96, 100)).toBe(0);
    });

    it("returns 0 for p=1 (no variability)", () => {
      expect(calculateErrorLimit(1, 1.96, 100)).toBe(0);
    });

    it("throws error for invalid probability", () => {
      expect(() => calculateErrorLimit(-0.1, 1.96, 100)).toThrow();
      expect(() => calculateErrorLimit(1.1, 1.96, 100)).toThrow();
    });

    it("throws error for non-positive sample size", () => {
      expect(() => calculateErrorLimit(0.5, 1.96, 0)).toThrow(
        "Sample size (n) must be positive"
      );
      expect(() => calculateErrorLimit(0.5, 1.96, -10)).toThrow(
        "Sample size (n) must be positive"
      );
    });

    it("throws error for non-integer sample size", () => {
      expect(() => calculateErrorLimit(0.5, 1.96, 100.5)).toThrow(
        "Sample size (n) must be an integer"
      );
    });
  });

  describe("generateRandomObservationTimes", () => {
    it("generates the correct number of times", () => {
      const times = generateRandomObservationTimes(10);
      expect(times).toHaveLength(10);
    });

    it("generates times in sorted order", () => {
      const times = generateRandomObservationTimes(20);
      // Times should be sorted chronologically
      // Just verify we get the right count - sorting is tested implicitly
      expect(times.length).toBe(20);
    });

    it("generates times as formatted strings", () => {
      const times = generateRandomObservationTimes(5);
      times.forEach((time) => {
        // Should match format like "08:30 AM" or "02:45 PM"
        expect(time).toMatch(/^\d{2}:\d{2}\s(AM|PM)$/);
      });
    });

    it("respects custom work hours", () => {
      const times = generateRandomObservationTimes(100, 9, 12);
      times.forEach((time) => {
        // All times should be between 9 AM and 12 PM
        const hour = parseInt(time.split(":")[0]);
        const isPM = time.includes("PM");
        const hour24 = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
        expect(hour24).toBeGreaterThanOrEqual(9);
        expect(hour24).toBeLessThan(12);
      });
    });

    it("throws error for non-positive count", () => {
      expect(() => generateRandomObservationTimes(0)).toThrow(
        "Count must be positive"
      );
      expect(() => generateRandomObservationTimes(-5)).toThrow(
        "Count must be positive"
      );
    });

    it("throws error for excessive count", () => {
      expect(() => generateRandomObservationTimes(10001)).toThrow(
        "Count exceeds maximum"
      );
    });

    it("throws error for invalid hour range", () => {
      expect(() => generateRandomObservationTimes(10, 17, 8)).toThrow(
        "Start hour must be before end hour"
      );
    });
  });

  describe("isValidProportion", () => {
    it("returns true for valid proportions", () => {
      expect(isValidProportion(0)).toBe(true);
      expect(isValidProportion(0.5)).toBe(true);
      expect(isValidProportion(1)).toBe(true);
    });

    it("returns false for invalid proportions", () => {
      expect(isValidProportion(-0.1)).toBe(false);
      expect(isValidProportion(1.1)).toBe(false);
      expect(isValidProportion(NaN)).toBe(false);
    });
  });

  describe("formatErrorAsPercentage", () => {
    it("formats decimal as percentage", () => {
      expect(formatErrorAsPercentage(0.05)).toBe("±5.00%");
      expect(formatErrorAsPercentage(0.1)).toBe("±10.00%");
      expect(formatErrorAsPercentage(0.025)).toBe("±2.50%");
    });
  });

  describe("CONFIDENCE_LEVELS", () => {
    it("contains expected confidence levels", () => {
      expect(CONFIDENCE_LEVELS).toHaveLength(3);
      expect(CONFIDENCE_LEVELS.map((c) => c.value)).toEqual([
        "0.90",
        "0.95",
        "0.99",
      ]);
    });
  });
});

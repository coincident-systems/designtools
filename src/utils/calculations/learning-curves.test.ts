import { describe, it, expect } from "vitest";
import {
  calculateTwoPointMethod,
  calculateRegressionMethod,
  predictTimeAtCycle,
  calculateCumulativeTime,
  exponentFromLearningRate,
  generateCurvePoints,
  formatLearningRate,
  formatExponent,
  LEARNING_RATE_PRESETS,
} from "./learning-curves";

describe("Learning Curve Calculations", () => {
  describe("calculateTwoPointMethod", () => {
    it("calculates correct parameters for 80% learning curve", () => {
      // For 80% learning: when production doubles, time goes to 80%
      // At cycle 50: 20 min, at cycle 100: 16 min (80% of 20)
      const result = calculateTwoPointMethod({
        x1: 50,
        y1: 20,
        x2: 100,
        y2: 16,
      });

      // Exponent should be log(0.8)/log(2) ≈ -0.322
      expect(result.exponent).toBeCloseTo(-0.322, 2);
      expect(result.learningRatePercent).toBeCloseTo(80, 1);
    });

    it("calculates correct first unit value", () => {
      const result = calculateTwoPointMethod({
        x1: 10,
        y1: 10,
        x2: 20,
        y2: 8, // 80% learning
      });

      // First unit should be higher than observed values
      expect(result.firstUnitValue).toBeGreaterThan(10);

      // Verify by back-calculating: y1 should equal a * x1^b
      const predicted = result.firstUnitValue * Math.pow(10, result.exponent);
      expect(predicted).toBeCloseTo(10, 1);
    });

    it("handles VB5 example values (50, 20min) to (100, 15min)", () => {
      // From the original VB5 form defaults
      const result = calculateTwoPointMethod({
        x1: 50,
        y1: 20,
        x2: 100,
        y2: 15,
      });

      // Learning rate should be around 75%
      expect(result.learningRatePercent).toBeCloseTo(75, 0);
      expect(result.exponent).toBeLessThan(0); // Should be negative (improvement)
    });

    it("throws error for non-positive cycle numbers", () => {
      expect(() =>
        calculateTwoPointMethod({ x1: 0, y1: 20, x2: 100, y2: 15 })
      ).toThrow("Cycle numbers must be positive");
      expect(() =>
        calculateTwoPointMethod({ x1: 50, y1: 20, x2: -10, y2: 15 })
      ).toThrow("Cycle numbers must be positive");
    });

    it("throws error for non-positive time values", () => {
      expect(() =>
        calculateTwoPointMethod({ x1: 50, y1: 0, x2: 100, y2: 15 })
      ).toThrow("Time/cost values must be positive");
      expect(() =>
        calculateTwoPointMethod({ x1: 50, y1: 20, x2: 100, y2: -5 })
      ).toThrow("Time/cost values must be positive");
    });

    it("throws error when cycle numbers are equal", () => {
      expect(() =>
        calculateTwoPointMethod({ x1: 50, y1: 20, x2: 50, y2: 15 })
      ).toThrow("Cycle numbers must be different");
    });

    it("throws error when second cycle is not greater", () => {
      expect(() =>
        calculateTwoPointMethod({ x1: 100, y1: 15, x2: 50, y2: 20 })
      ).toThrow("Second cycle number must be greater than first");
    });

    it("throws error when no learning improvement", () => {
      expect(() =>
        calculateTwoPointMethod({ x1: 50, y1: 15, x2: 100, y2: 20 })
      ).toThrow("Second time must be less than first");
    });
  });

  describe("calculateRegressionMethod", () => {
    it("calculates parameters from multiple data points", () => {
      // Generate data for known 80% learning curve
      const b = Math.log(0.8) / Math.log(2);
      const a = 100;
      const cycles = [1, 2, 4, 8, 16, 32];
      const times = cycles.map((x) => a * Math.pow(x, b));

      const result = calculateRegressionMethod({ cycles, times });

      expect(result.exponent).toBeCloseTo(b, 3);
      expect(result.firstUnitValue).toBeCloseTo(a, 1);
      expect(result.learningRatePercent).toBeCloseTo(80, 1);
      expect(result.rSquared).toBeCloseTo(1, 3); // Perfect fit
    });

    it("handles noisy data", () => {
      // Data with some noise
      const cycles = [1, 5, 10, 20, 40, 80];
      const times = [100, 72, 55, 42, 32, 25]; // Approximately 80% learning

      const result = calculateRegressionMethod({ cycles, times });

      expect(result.learningRatePercent).toBeGreaterThan(70);
      expect(result.learningRatePercent).toBeLessThan(90);
      expect(result.rSquared).toBeGreaterThan(0.9);
    });

    it("throws error for mismatched array lengths", () => {
      expect(() =>
        calculateRegressionMethod({
          cycles: [1, 2, 3],
          times: [100, 80],
        })
      ).toThrow("Cycles and times arrays must have the same length");
    });

    it("throws error for insufficient data", () => {
      expect(() =>
        calculateRegressionMethod({
          cycles: [1],
          times: [100],
        })
      ).toThrow("At least 2 data points are required");
    });

    it("throws error for non-positive values", () => {
      expect(() =>
        calculateRegressionMethod({
          cycles: [0, 2, 4],
          times: [100, 80, 64],
        })
      ).toThrow("All cycle numbers must be positive");

      expect(() =>
        calculateRegressionMethod({
          cycles: [1, 2, 4],
          times: [100, 0, 64],
        })
      ).toThrow("All time values must be positive");
    });
  });

  describe("predictTimeAtCycle", () => {
    it("predicts time correctly", () => {
      // 80% learning curve: a=100, b=-0.322
      const a = 100;
      const b = Math.log(0.8) / Math.log(2);

      // At cycle 1, should be 100
      expect(predictTimeAtCycle(1, a, b)).toBeCloseTo(100, 1);

      // At cycle 2, should be 80 (80% of 100)
      expect(predictTimeAtCycle(2, a, b)).toBeCloseTo(80, 1);

      // At cycle 4, should be 64 (80% of 80)
      expect(predictTimeAtCycle(4, a, b)).toBeCloseTo(64, 1);
    });

    it("throws error for non-positive cycle", () => {
      expect(() => predictTimeAtCycle(0, 100, -0.322)).toThrow(
        "Cycle number must be positive"
      );
      expect(() => predictTimeAtCycle(-5, 100, -0.322)).toThrow(
        "Cycle number must be positive"
      );
    });
  });

  describe("calculateCumulativeTime", () => {
    it("calculates cumulative time for small n", () => {
      const a = 100;
      const b = Math.log(0.8) / Math.log(2);

      // Manual calculation for first 4 cycles
      const expected =
        a * Math.pow(1, b) +
        a * Math.pow(2, b) +
        a * Math.pow(3, b) +
        a * Math.pow(4, b);

      expect(calculateCumulativeTime(4, a, b)).toBeCloseTo(expected, 1);
    });

    it("throws error for non-positive n", () => {
      expect(() => calculateCumulativeTime(0, 100, -0.322)).toThrow(
        "Number of cycles must be a positive integer"
      );
    });

    it("throws error for non-integer n", () => {
      expect(() => calculateCumulativeTime(5.5, 100, -0.322)).toThrow(
        "Number of cycles must be a positive integer"
      );
    });
  });

  describe("exponentFromLearningRate", () => {
    it("calculates correct exponent for 80% learning rate", () => {
      const b = exponentFromLearningRate(80);
      expect(b).toBeCloseTo(Math.log(0.8) / Math.log(2), 5);
    });

    it("calculates correct exponent for 70% learning rate", () => {
      const b = exponentFromLearningRate(70);
      expect(Math.pow(2, b)).toBeCloseTo(0.7, 3);
    });

    it("calculates correct exponent for 90% learning rate", () => {
      const b = exponentFromLearningRate(90);
      expect(Math.pow(2, b)).toBeCloseTo(0.9, 3);
    });

    it("throws error for learning rate <= 0", () => {
      expect(() => exponentFromLearningRate(0)).toThrow(
        "Learning rate must be between 0 and 100"
      );
      expect(() => exponentFromLearningRate(-10)).toThrow(
        "Learning rate must be between 0 and 100"
      );
    });

    it("throws error for learning rate >= 100", () => {
      expect(() => exponentFromLearningRate(100)).toThrow(
        "Learning rate must be between 0 and 100"
      );
      expect(() => exponentFromLearningRate(110)).toThrow(
        "Learning rate must be between 0 and 100"
      );
    });
  });

  describe("generateCurvePoints", () => {
    it("generates correct number of points", () => {
      const points = generateCurvePoints(100, -0.322, 100, 20);
      expect(points.length).toBe(20);
    });

    it("first point starts at or near x=1", () => {
      const points = generateCurvePoints(100, -0.322, 100, 50);
      expect(points[0].x).toBe(1);
    });

    it("last point ends at maxCycles", () => {
      const points = generateCurvePoints(100, -0.322, 100, 50);
      expect(points[points.length - 1].x).toBe(100);
    });

    it("y values decrease as x increases", () => {
      const points = generateCurvePoints(100, -0.322, 100, 10);
      for (let i = 1; i < points.length; i++) {
        if (points[i].x > points[i - 1].x) {
          expect(points[i].y).toBeLessThanOrEqual(points[i - 1].y);
        }
      }
    });

    it("throws error for maxCycles <= 1", () => {
      expect(() => generateCurvePoints(100, -0.322, 1, 10)).toThrow(
        "Maximum cycles must be greater than 1"
      );
    });

    it("throws error for points < 2", () => {
      expect(() => generateCurvePoints(100, -0.322, 100, 1)).toThrow(
        "Must generate at least 2 points"
      );
    });
  });

  describe("formatLearningRate", () => {
    it("formats rate as percentage", () => {
      expect(formatLearningRate(0.8)).toBe("80.0%");
      expect(formatLearningRate(0.75)).toBe("75.0%");
      expect(formatLearningRate(0.854)).toBe("85.4%");
    });
  });

  describe("formatExponent", () => {
    it("formats exponent to 4 decimal places", () => {
      expect(formatExponent(-0.32192809)).toBe("-0.3219");
      expect(formatExponent(-0.5)).toBe("-0.5000");
    });
  });

  describe("LEARNING_RATE_PRESETS", () => {
    it("contains common learning rates", () => {
      const values = LEARNING_RATE_PRESETS.map((p) => p.value);
      expect(values).toContain(70);
      expect(values).toContain(80);
      expect(values).toContain(90);
    });

    it("presets are in ascending order", () => {
      for (let i = 1; i < LEARNING_RATE_PRESETS.length; i++) {
        expect(LEARNING_RATE_PRESETS[i].value).toBeGreaterThan(
          LEARNING_RATE_PRESETS[i - 1].value
        );
      }
    });
  });
});

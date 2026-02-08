import { z } from "zod/v4";

/**
 * Learning Curves Schemas
 *
 * Two-Point: Y = a * X^b, derive from 2 data points
 * Regression: Least squares on log-transformed data
 */

export const learningCurveTwoPointSchema = z
  .object({
    x1: z
      .number({ error: "First cycle number is required" })
      .int("Cycle must be a whole number")
      .min(1, "Cycle must be >= 1"),
    y1: z
      .number({ error: "First time/cost is required" })
      .positive("Time must be positive"),
    x2: z
      .number({ error: "Second cycle number is required" })
      .int("Cycle must be a whole number")
      .min(2, "Second cycle must be >= 2"),
    y2: z
      .number({ error: "Second time/cost is required" })
      .positive("Time must be positive"),
    predictionCycle: z
      .number()
      .int("Prediction cycle must be a whole number")
      .min(1)
      .optional(),
  })
  .refine((data) => data.x2 > data.x1, {
    message: "Second cycle must be greater than first",
  })
  .refine((data) => data.y2 < data.y1, {
    message: "Second time must be less than first (learning improvement)",
  });

/** Single data point for regression */
export const learningCurveDataPointSchema = z.object({
  cycle: z
    .number({ error: "Cycle is required" })
    .int("Cycle must be a whole number")
    .min(1, "Cycle must be >= 1"),
  time: z
    .number({ error: "Time is required" })
    .positive("Time must be positive"),
});

export const learningCurveRegressionSchema = z.object({
  dataPoints: z
    .array(learningCurveDataPointSchema)
    .min(2, "At least 2 data points required")
    .max(100, "Maximum 100 data points"),
  predictionCycle: z
    .number()
    .int("Prediction cycle must be a whole number")
    .min(1)
    .optional(),
});

export type LearningCurveTwoPointInput = z.infer<typeof learningCurveTwoPointSchema>;
export type LearningCurveDataPoint = z.infer<typeof learningCurveDataPointSchema>;
export type LearningCurveRegressionInput = z.infer<typeof learningCurveRegressionSchema>;

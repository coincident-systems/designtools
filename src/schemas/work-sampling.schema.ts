import { z } from "zod/v4";

/**
 * Work Sampling Schemas
 *
 * Sample size: n = (z^2 * p * (1-p)) / l^2
 * Error limit: l = z * sqrt(p * (1-p) / n)
 */

export const confidenceLevelSchema = z.enum(["0.90", "0.95", "0.99"]);

export const workSamplingSampleSizeSchema = z.object({
  proportion: z
    .number({ error: "Proportion is required" })
    .min(0.01, "Proportion must be > 0")
    .max(0.99, "Proportion must be < 1"),
  confidence: confidenceLevelSchema,
  errorLimit: z
    .number({ error: "Error limit is required" })
    .min(0.001, "Error limit must be > 0")
    .max(0.5, "Error limit must be <= 50%"),
});

export const workSamplingErrorLimitSchema = z.object({
  proportion: z
    .number({ error: "Proportion is required" })
    .min(0.01, "Proportion must be > 0")
    .max(0.99, "Proportion must be < 1"),
  confidence: confidenceLevelSchema,
  sampleSize: z
    .number({ error: "Sample size is required" })
    .int("Sample size must be a whole number")
    .min(1, "Sample size must be >= 1")
    .max(100000, "Sample size exceeds maximum"),
});

export const workSamplingRandomTimesSchema = z
  .object({
    count: z
      .number({ error: "Count is required" })
      .int("Count must be a whole number")
      .min(1, "At least 1 observation required")
      .max(10000, "Maximum 10,000 observations"),
    startHour: z
      .number()
      .int()
      .min(0, "Start hour must be 0-23")
      .max(23),
    endHour: z
      .number()
      .int()
      .min(1, "End hour must be 1-24")
      .max(24),
  })
  .refine((data) => data.startHour < data.endHour, {
    message: "Start hour must be before end hour",
  });

export type WorkSamplingSampleSizeInput = z.infer<typeof workSamplingSampleSizeSchema>;
export type WorkSamplingErrorLimitInput = z.infer<typeof workSamplingErrorLimitSchema>;
export type WorkSamplingRandomTimesInput = z.infer<typeof workSamplingRandomTimesSchema>;

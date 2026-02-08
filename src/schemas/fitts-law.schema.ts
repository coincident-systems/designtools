import { z } from "zod/v4";

/**
 * Fitts' Law Schemas
 *
 * MT = a + b * ID
 * ID = log2(D/W + 1)   (Shannon formulation)
 */

export const fittsTargetSchema = z.object({
  distance: z
    .number({ error: "Distance is required" })
    .positive("Distance must be positive"),
  width: z
    .number({ error: "Width is required" })
    .positive("Width must be positive"),
});

export const fittsTrialSchema = z.object({
  targetId: z.string(),
  distance: z.number().positive(),
  width: z.number().positive(),
  indexOfDifficulty: z.number().min(0),
  movementTime: z.number().min(0),
  hit: z.boolean(),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  targetX: z.number(),
  targetY: z.number(),
});

/** Configuration for a Fitts' Law test session */
export const fittsTestConfigSchema = z.object({
  trialsPerCondition: z
    .number()
    .int()
    .min(1, "At least 1 trial per condition")
    .max(10, "Maximum 10 trials per condition")
    .default(3),
  containerWidth: z.number().positive().default(600),
  containerHeight: z.number().positive().default(400),
});

export type FittsTargetInput = z.infer<typeof fittsTargetSchema>;
export type FittsTrialInput = z.infer<typeof fittsTrialSchema>;
export type FittsTestConfigInput = z.infer<typeof fittsTestConfigSchema>;

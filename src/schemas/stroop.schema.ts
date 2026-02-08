import { z } from "zod/v4";

/**
 * Stroop Test Schemas
 *
 * Conditions: congruent, incongruent, neutral
 * Measures: RT (ms), accuracy, interference effect
 */

export const colorNameSchema = z.enum(["red", "blue", "green", "yellow"]);
export const trialTypeSchema = z.enum(["congruent", "incongruent", "neutral"]);

export const stroopTrialSchema = z.object({
  id: z.string(),
  type: trialTypeSchema,
  word: z.string(),
  inkColor: colorNameSchema,
  correctAnswer: colorNameSchema,
  userAnswer: colorNameSchema.nullable(),
  responseTime: z.number().min(0).nullable(),
  correct: z.boolean().nullable(),
  timestamp: z.number(),
});

/** Configuration for a Stroop test session */
export const stroopTestConfigSchema = z.object({
  trialsPerType: z
    .number()
    .int()
    .min(5, "At least 5 trials per type")
    .max(50, "Maximum 50 trials per type")
    .default(10),
});

export type ColorNameInput = z.infer<typeof colorNameSchema>;
export type TrialTypeInput = z.infer<typeof trialTypeSchema>;
export type StroopTrialInput = z.infer<typeof stroopTrialSchema>;
export type StroopTestConfigInput = z.infer<typeof stroopTestConfigSchema>;

import { z } from "zod/v4";

/**
 * Time Study Schemas
 *
 * Standard Time = Normal Time * (1 + Allowance)
 * Normal Time = Observed Time * Rating Factor
 * Rating Factor = 1 + Σ(Westinghouse adjustments)
 */

export const skillRatingSchema = z.enum([
  "A1", "A2", "B1", "B2", "C1", "C2", "D", "E1", "E2", "F1", "F2",
]);

export const effortRatingSchema = z.enum([
  "A1", "A2", "B1", "B2", "C1", "C2", "D", "E1", "E2", "F1", "F2",
]);

export const conditionsRatingSchema = z.enum(["A", "B", "C", "D", "E", "F"]);

export const consistencyRatingSchema = z.enum(["A", "B", "C", "D", "E", "F"]);

export const westinghouseRatingSchema = z.object({
  skill: skillRatingSchema,
  effort: effortRatingSchema,
  conditions: conditionsRatingSchema,
  consistency: consistencyRatingSchema,
});

export const timeStudySchema = z.object({
  observations: z
    .array(
      z.number({ error: "Observation must be a number" })
        .positive("Observation must be positive")
    )
    .min(2, "At least 2 observations required")
    .max(30, "Maximum 30 observations"),
  rating: westinghouseRatingSchema,
  allowancePercent: z
    .number({ error: "Allowance is required" })
    .min(0, "Allowance cannot be negative")
    .max(100, "Allowance cannot exceed 100%")
    .default(15),
});

export type SkillRatingKey = z.infer<typeof skillRatingSchema>;
export type EffortRatingKey = z.infer<typeof effortRatingSchema>;
export type ConditionsRatingKey = z.infer<typeof conditionsRatingSchema>;
export type ConsistencyRatingKey = z.infer<typeof consistencyRatingSchema>;
export type WestinghouseRatingInput = z.infer<typeof westinghouseRatingSchema>;
export type TimeStudyInput = z.infer<typeof timeStudySchema>;

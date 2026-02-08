import { z } from "zod/v4";

/**
 * Pareto Analysis Schemas
 *
 * 80/20 rule: ~80% of effects from ~20% of causes
 */

export const paretoItemSchema = z.object({
  id: z.string(),
  category: z
    .string({ error: "Category name is required" })
    .min(1, "Category cannot be empty")
    .max(50, "Category name too long"),
  value: z
    .number({ error: "Value is required" })
    .min(0, "Value cannot be negative"),
});

export const paretoAnalysisSchema = z.object({
  items: z
    .array(paretoItemSchema)
    .min(2, "At least 2 categories required")
    .max(20, "Maximum 20 categories"),
  vitalFewThreshold: z
    .number()
    .min(50, "Threshold must be 50-99%")
    .max(99, "Threshold must be 50-99%")
    .default(80),
});

export type ParetoItemInput = z.infer<typeof paretoItemSchema>;
export type ParetoAnalysisInput = z.infer<typeof paretoAnalysisSchema>;

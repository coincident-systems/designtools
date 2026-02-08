import { z } from "zod/v4";

/**
 * Break-Even Analysis Schemas
 *
 * BEQ = FC / (P - VC)
 * Contribution Margin = P - VC
 */

export const breakEvenSchema = z
  .object({
    fixedCosts: z
      .number({ error: "Fixed costs are required" })
      .min(0, "Fixed costs cannot be negative"),
    variableCostPerUnit: z
      .number({ error: "Variable cost is required" })
      .min(0, "Variable cost cannot be negative"),
    sellingPricePerUnit: z
      .number({ error: "Selling price is required" })
      .positive("Selling price must be positive"),
    targetProfit: z
      .number()
      .min(0, "Target profit cannot be negative")
      .optional(),
    currentQuantity: z
      .number()
      .min(0, "Current quantity cannot be negative")
      .optional(),
  })
  .refine((data) => data.sellingPricePerUnit > data.variableCostPerUnit, {
    message: "Selling price must exceed variable cost for viable business model",
  });

export type BreakEvenInput = z.infer<typeof breakEvenSchema>;

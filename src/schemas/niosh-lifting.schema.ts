import { z } from "zod/v4";

/**
 * NIOSH Lifting Equation Schemas
 *
 * RWL = LC * HM * VM * DM * AM * FM * CM
 * LI = Load Weight / RWL
 */

export const unitSchema = z.enum(["metric", "imperial"]);
export const durationSchema = z.enum(["short", "moderate", "long"]);
export const couplingSchema = z.enum(["good", "fair", "poor"]);

export const nioshLiftingSchema = z.object({
  horizontalDistance: z
    .number({ error: "Horizontal distance is required" })
    .positive("Distance must be positive"),
  verticalDistance: z
    .number({ error: "Vertical distance is required" })
    .min(0, "Distance cannot be negative"),
  travelDistance: z
    .number({ error: "Travel distance is required" })
    .positive("Distance must be positive"),
  asymmetricAngle: z
    .number({ error: "Angle is required" })
    .min(0, "Angle must be 0-135 degrees")
    .max(135, "Angle must be 0-135 degrees"),
  frequency: z
    .number({ error: "Frequency is required" })
    .min(0.2, "Minimum 0.2 lifts/min")
    .max(15, "Maximum 15 lifts/min"),
  duration: durationSchema,
  coupling: couplingSchema,
  loadWeight: z
    .number({ error: "Load weight is required" })
    .positive("Weight must be positive"),
  unit: unitSchema,
});

export type UnitType = z.infer<typeof unitSchema>;
export type DurationType = z.infer<typeof durationSchema>;
export type CouplingType = z.infer<typeof couplingSchema>;
export type NioshLiftingInput = z.infer<typeof nioshLiftingSchema>;

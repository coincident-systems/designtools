import { z } from "zod/v4";

/**
 * OSHA Noise Dose Schemas
 *
 * Dose = Σ(C_i / T_i) * 100
 * TWA = 16.61 * log10(Dose/100) + 90
 */

export const noiseExposureSchema = z.object({
  level: z
    .number({ error: "Noise level is required" })
    .min(80, "Minimum measurable level is 80 dB")
    .max(130, "Maximum level is 130 dB"),
  duration: z
    .number({ error: "Duration is required" })
    .positive("Duration must be positive")
    .max(24, "Duration cannot exceed 24 hours"),
});

export const noiseDoseSchema = z.object({
  exposures: z
    .array(noiseExposureSchema)
    .min(1, "At least one noise exposure required")
    .max(8, "Maximum 8 exposure entries"),
});

export type NoiseExposureInput = z.infer<typeof noiseExposureSchema>;
export type NoiseDoseInput = z.infer<typeof noiseDoseSchema>;

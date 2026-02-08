/**
 * Zod Schemas for DesignTools
 *
 * Every form in the application is validated against these schemas.
 * They serve as the single source of truth for:
 *   1. Runtime validation (react-hook-form + @hookform/resolvers)
 *   2. TypeScript types (via z.infer<>)
 *   3. Error messages (user-facing, contextual)
 *
 * Convention: Each module exports a `*Schema` and a `*Input` type.
 */
export * from "./work-sampling.schema";
export * from "./learning-curves.schema";
export * from "./time-study.schema";
export * from "./niosh-lifting.schema";
export * from "./noise-dose.schema";
export * from "./break-even.schema";
export * from "./fitts-law.schema";
export * from "./stroop.schema";
export * from "./pareto.schema";

/**
 * Shared Form Components
 *
 * Reusable building blocks for all 61 DesignTools calculator modules.
 * These map to common VB5 control patterns and are designed for
 * integration with react-hook-form + Zod validation.
 *
 * VB5 Control Mapping:
 *   TextBox        → FormInput
 *   ComboBox       → FormSelect
 *   Frame          → FormFrame
 *   TextBox (RO)   → ResultsDisplay
 *   CommandButton   → CalculateButton
 *   Help Forms     → HelpPanel
 */
export { FormInput, type FormInputProps } from "./FormInput";
export { FormSelect, type FormSelectProps, type SelectOption } from "./FormSelect";
export { FormFrame, type FormFrameProps } from "./FormFrame";
export {
  ResultsDisplay,
  type ResultsDisplayProps,
  type ResultItem,
} from "./ResultsDisplay";
export { CalculateButton, type CalculateButtonProps } from "./CalculateButton";
export { HelpPanel, type HelpPanelProps } from "./HelpPanel";

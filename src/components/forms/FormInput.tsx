import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * FormInput - Text/number input with label, unit display, and validation error.
 *
 * Maps to VB5 TextBox control. Designed for integration with react-hook-form
 * via `register()` or as a controlled component.
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <FormInput
 *   label="Element Time"
 *   unit="min"
 *   error={errors.elementTime?.message}
 *   {...register("elementTime", { valueAsNumber: true })}
 * />
 *
 * // Controlled
 * <FormInput
 *   label="Sample Size"
 *   type="number"
 *   value={n}
 *   onChange={(e) => setN(e.target.value)}
 * />
 * ```
 */
export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label: string;
  /** Unit suffix displayed after the input (e.g., "min", "kg", "dB") */
  unit?: string;
  /** Validation error message */
  error?: string;
  /** Additional help text below the input */
  hint?: string;
  /** Layout direction */
  orientation?: "vertical" | "horizontal";
  /** Custom class for the wrapper */
  wrapperClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      unit,
      error,
      hint,
      orientation = "vertical",
      wrapperClassName,
      className,
      id,
      ...inputProps
    },
    ref
  ) => {
    const inputId = id || `form-input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div
        className={cn(
          "space-y-1.5",
          orientation === "horizontal" && "flex items-center gap-3 space-y-0",
          wrapperClassName
        )}
      >
        <Label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-foreground",
            orientation === "horizontal" && "min-w-[120px] shrink-0",
            error && "text-destructive"
          )}
        >
          {label}
        </Label>
        <div className="flex-1">
          <div className={cn("relative", unit && "flex items-center gap-2")}>
            <Input
              ref={ref}
              id={inputId}
              className={cn(
                "font-mono tabular-nums",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${inputId}-error`
                  : hint
                    ? `${inputId}-hint`
                    : undefined
              }
              {...inputProps}
            />
            {unit && (
              <span className="text-sm text-muted-foreground font-mono shrink-0">
                {unit}
              </span>
            )}
          </div>
          {error && (
            <p
              id={`${inputId}-error`}
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          {hint && !error && (
            <p
              id={`${inputId}-hint`}
              className="mt-1 text-xs text-muted-foreground"
            >
              {hint}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

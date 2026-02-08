import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * FormSelect - Dropdown with label and validation.
 *
 * Maps to VB5 ComboBox (Style 2 - Dropdown List). Designed for use with
 * react-hook-form Controller or as a standalone controlled component.
 *
 * @example
 * ```tsx
 * // With react-hook-form Controller
 * <Controller
 *   name="confidence"
 *   control={control}
 *   render={({ field }) => (
 *     <FormSelect
 *       label="Confidence Level"
 *       options={[
 *         { value: "0.90", label: "90%" },
 *         { value: "0.95", label: "95%" },
 *         { value: "0.99", label: "99%" },
 *       ]}
 *       value={field.value}
 *       onValueChange={field.onChange}
 *     />
 *   )}
 * />
 * ```
 */
export interface SelectOption {
  /** Value stored in form state */
  value: string;
  /** Display text in dropdown */
  label: string;
  /** Optional description shown below label */
  description?: string;
}

export interface FormSelectProps {
  /** Select label text */
  label: string;
  /** Available options */
  options: SelectOption[];
  /** Current value */
  value?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Validation error message */
  error?: string;
  /** Additional help text */
  hint?: string;
  /** Layout direction */
  orientation?: "vertical" | "horizontal";
  /** Disabled state */
  disabled?: boolean;
  /** Custom class for the wrapper */
  wrapperClassName?: string;
  /** Custom class for the trigger */
  className?: string;
}

export function FormSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  error,
  hint,
  orientation = "vertical",
  disabled = false,
  wrapperClassName,
  className,
}: FormSelectProps) {
  const selectId = `form-select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={cn(
        "space-y-1.5",
        orientation === "horizontal" && "flex items-center gap-3 space-y-0",
        wrapperClassName
      )}
    >
      <Label
        htmlFor={selectId}
        className={cn(
          "text-sm font-medium text-foreground",
          orientation === "horizontal" && "min-w-[120px] shrink-0",
          error && "text-destructive"
        )}
      >
        {label}
      </Label>
      <div className="flex-1">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={selectId}
            className={cn(
              "font-mono",
              error && "border-destructive focus:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="font-mono"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${selectId}-hint`}
            className="mt-1 text-xs text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

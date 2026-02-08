import { Button } from "@/components/ui/button";
import { Loader2, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CalculateButton - Primary action button for triggering calculations.
 *
 * Maps to VB5 CommandButton ("Calculate", "Compute", etc.). Provides
 * loading state, disabled logic, and consistent styling across all
 * calculator modules.
 *
 * @example
 * ```tsx
 * <CalculateButton onClick={handleCalculate} loading={isCalculating}>
 *   Calculate Standard Time
 * </CalculateButton>
 *
 * // With react-hook-form
 * <CalculateButton type="submit" loading={isSubmitting}>
 *   Compute RWL
 * </CalculateButton>
 * ```
 */
export interface CalculateButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant"> {
  /** Loading/computing state */
  loading?: boolean;
  /** Show calculator icon */
  showIcon?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
}

export function CalculateButton({
  children = "Calculate",
  loading = false,
  showIcon = true,
  fullWidth = false,
  disabled,
  className,
  ...buttonProps
}: CalculateButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "bg-accent text-accent-foreground hover:bg-accent/90",
        "font-semibold shadow-sm transition-all",
        "hover:shadow-md active:scale-[0.98]",
        fullWidth && "w-full",
        className
      )}
      disabled={loading || disabled}
      aria-busy={loading}
      {...buttonProps}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : showIcon ? (
        <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
      ) : null}
      {loading ? "Computing..." : children}
    </Button>
  );
}

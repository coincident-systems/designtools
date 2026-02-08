import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FormFrame - Grouped input section with title border.
 *
 * Maps to VB5 Frame control. Groups related form inputs under a
 * labeled section header. Use for logically related fields like
 * "Westinghouse Ratings" or "Lifting Parameters".
 *
 * @example
 * ```tsx
 * <FormFrame title="Westinghouse Ratings" columns={2}>
 *   <FormSelect label="Skill" ... />
 *   <FormSelect label="Effort" ... />
 *   <FormSelect label="Conditions" ... />
 *   <FormSelect label="Consistency" ... />
 * </FormFrame>
 * ```
 */
export interface FormFrameProps {
  /** Section title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Child form elements */
  children: ReactNode;
  /** Number of columns for grid layout (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Compact mode reduces padding */
  compact?: boolean;
  /** Custom class for the wrapper */
  className?: string;
}

export function FormFrame({
  title,
  description,
  children,
  columns = 1,
  compact = false,
  className,
}: FormFrameProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className={cn(compact && "pb-2 pt-4 px-4")}>
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className={cn(compact && "px-4 pb-4")}>
        <div className={cn("grid gap-4", gridClass)}>{children}</div>
      </CardContent>
    </Card>
  );
}

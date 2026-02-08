import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ResultsDisplay - Formatted output display for calculation results.
 *
 * Maps to VB5 TextBox with MultiLine=True, ReadOnly. Provides both
 * a monospace text mode (for raw calculation output) and a structured
 * key-value mode (for labeled results).
 *
 * @example
 * ```tsx
 * // Monospace text output
 * <ResultsDisplay title="Calculation Results">
 *   {`Standard Time: 12.45 min\nNormal Time: 10.82 min`}
 * </ResultsDisplay>
 *
 * // Structured key-value results
 * <ResultsDisplay
 *   title="Analysis"
 *   items={[
 *     { label: "RWL", value: "23.4 kg", status: "success" },
 *     { label: "Lifting Index", value: "1.8", status: "warning" },
 *   ]}
 * />
 * ```
 */
export interface ResultItem {
  /** Label for the result */
  label: string;
  /** Display value */
  value: string | number;
  /** Optional status coloring */
  status?: "default" | "success" | "warning" | "danger" | "info";
  /** Optional unit suffix */
  unit?: string;
  /** Optional description/subtitle text */
  description?: string;
  /** Use monospace font for value */
  monospace?: boolean;
}

export interface ResultsDisplayProps {
  /** Results section title */
  title?: string;
  /** Structured result items (key-value display) */
  items?: ResultItem[];
  /** Raw text content (monospace display) */
  children?: ReactNode;
  /** Show empty state when no results */
  emptyMessage?: string;
  /** Custom class */
  className?: string;
  /** Compact mode */
  compact?: boolean;
  /** Overall status coloring for the card */
  status?: "default" | "success" | "warning" | "danger" | "info";
}

const statusColors: Record<NonNullable<ResultItem["status"]>, string> = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function ResultsDisplay({
  title,
  items,
  children,
  emptyMessage = "Results will appear here after calculation...",
  className,
  compact = false,
}: ResultsDisplayProps) {
  const hasContent = children || (items && items.length > 0);

  return (
    <Card
      className={cn("border-border/60", className)}
      role="region"
      aria-label={title || "Calculation results"}
      aria-live="polite"
    >
      {title && (
        <CardHeader className={cn(compact && "pb-2 pt-4 px-4")}>
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(compact && "px-4 pb-4", !title && "pt-6")}>
        {!hasContent ? (
          <div className="results-panel">
            <span className="text-muted-foreground italic">{emptyMessage}</span>
          </div>
        ) : items ? (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                className="flex flex-col py-1.5 border-b border-border/40 last:border-0"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      item.monospace && "font-mono",
                      statusColors[item.status || "default"]
                    )}
                  >
                    {item.value}
                    {item.unit && (
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        {item.unit}
                      </span>
                    )}
                  </span>
                </div>
                {item.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">{item.description}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="results-panel">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

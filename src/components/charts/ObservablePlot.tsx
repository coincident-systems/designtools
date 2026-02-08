import { useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";
import { cn } from "@/lib/utils";

/**
 * ObservablePlot - React wrapper for Observable Plot (by Mike Bostock, D3 creator).
 *
 * This is the charting foundation for DesignTools. Observable Plot is what
 * Quarto uses under the hood -- declarative, publication-quality SVG output,
 * fully CSS-themeable.
 *
 * The component handles:
 * - Mounting/unmounting the Plot SVG into a container div
 * - Applying the DesignTools theme (MSU colors, Fira Code for ticks)
 * - Responsive width via container query
 * - Dark mode support via CSS custom properties
 *
 * @example
 * ```tsx
 * import * as Plot from "@observablehq/plot";
 *
 * <ObservablePlot
 *   options={{
 *     marks: [
 *       Plot.barY(data, { x: "category", y: "value", fill: "var(--chart-1)" }),
 *       Plot.ruleY([0]),
 *     ],
 *     x: { label: "Category" },
 *     y: { label: "Value", grid: true },
 *   }}
 * />
 * ```
 */
export interface ObservablePlotProps {
  /** Plot.plot() options -- marks, scales, axes, etc. */
  options: Plot.PlotOptions;
  /** Additional CSS class for the container */
  className?: string;
  /** Accessible description for screen readers */
  ariaLabel?: string;
}

/** MSU-themed default plot options */
const themeDefaults: Partial<Plot.PlotOptions> = {
  style: {
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    fontSize: "12px",
    overflow: "visible",
  },
  marginTop: 30,
  marginRight: 20,
  marginBottom: 40,
  marginLeft: 50,
};

export function ObservablePlot({
  options,
  className,
  ariaLabel,
}: ObservablePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Merge theme defaults with user options
    const mergedStyle = {
      ...(themeDefaults.style as Record<string, string>),
      ...(typeof options.style === "object" ? (options.style as Record<string, string>) : {}),
    };

    const mergedOptions: Plot.PlotOptions = {
      ...themeDefaults,
      ...options,
      style: mergedStyle,
      // Use container width if not specified
      width: options.width ?? containerRef.current.clientWidth,
    };

    const plot = Plot.plot(mergedOptions);

    // Clear previous render and append new plot
    containerRef.current.textContent = "";
    containerRef.current.appendChild(plot);

    // Cleanup on unmount
    return () => {
      plot.remove();
    };
  }, [options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full [&_svg]:w-full [&_svg]:h-auto",
        // Theme the Observable Plot SVG with CSS custom properties
        "[&_text]:fill-foreground",
        "[&_.tick_text]:fill-muted-foreground [&_.tick_text]:font-mono [&_.tick_text]:text-[11px]",
        "[&_[aria-label='x-axis']_text]:fill-foreground [&_[aria-label='y-axis']_text]:fill-foreground",
        "[&_.tick_line]:stroke-border [&_.domain]:stroke-border",
        "[&_line[aria-label='rule']]:stroke-border",
        className
      )}
      role="img"
      aria-label={ariaLabel || "Chart"}
    />
  );
}

/**
 * Pre-built color scales using MSU brand palette.
 * Use these with Observable Plot's `color` scale option.
 */
export const chartPalette = {
  /** Categorical color scheme for up to 6 categories */
  categorical: [
    "var(--chart-1)", // MSU Blue
    "var(--chart-3)", // MSU Gold
    "var(--chart-2)", // Teal
    "var(--chart-4)", // Light Blue
    "var(--chart-5)", // Light Teal
    "var(--destructive)", // Red (for danger/alerts)
  ],
  /** Sequential blue scale (light to dark) */
  sequentialBlue: ["#c5d5ed", "#7da0d0", "#4a7fd6", "#1e3a80", "#162960"],
  /** Diverging blue-gold scale */
  diverging: ["#162960", "#4a7fd6", "#c5d5ed", "#fada92", "#f4b425", "#d49a10"],
  /** Status colors for risk/compliance levels */
  status: {
    safe: "#16a34a",
    caution: "#f4b425",
    danger: "#dc3545",
  },
} as const;

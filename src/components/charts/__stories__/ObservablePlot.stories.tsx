import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Plot from "@observablehq/plot";
import { ObservablePlot, chartPalette } from "../ObservablePlot";

/**
 * ObservablePlot is the charting foundation for DesignTools. Built on
 * Observable Plot by Mike Bostock (creator of D3) -- the same engine
 * that powers Quarto publications.
 *
 * All charts render as SVG, are themed with CSS custom properties,
 * and support dark mode automatically.
 *
 * **Figma Component:** `Charts / Plot`
 */
const meta: Meta<typeof ObservablePlot> = {
  title: "Charts/ObservablePlot",
  component: ObservablePlot,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ObservablePlot>;

// Sample data
const paretoData = [
  { category: "Machine Breakdown", value: 42 },
  { category: "Material Defects", value: 28 },
  { category: "Operator Error", value: 15 },
  { category: "Tool Wear", value: 8 },
  { category: "Setup Issues", value: 4 },
  { category: "Documentation", value: 2 },
  { category: "Other", value: 1 },
];

const learningCurveData = Array.from({ length: 50 }, (_, i) => ({
  cycle: i + 1,
  time: 100 * Math.pow(i + 1, -0.322), // 80% learning curve
}));

const breakEvenData = Array.from({ length: 21 }, (_, i) => {
  const q = i * 50;
  return {
    quantity: q,
    revenue: q * 25,
    totalCost: 5000 + q * 15,
  };
});

export const BarChart: Story = {
  args: {
    options: {
      height: 300,
      marks: [
        Plot.barY(paretoData, {
          x: "category",
          y: "value",
          fill: "var(--chart-1)",
          sort: { x: "-y" },
        }),
        Plot.ruleY([0]),
      ],
      x: { label: null, tickRotate: -30 },
      y: { label: "Frequency", grid: true },
    },
    ariaLabel: "Pareto bar chart of defect categories",
  },
};

export const LineChart: Story = {
  args: {
    options: {
      height: 300,
      marks: [
        Plot.line(learningCurveData, {
          x: "cycle",
          y: "time",
          stroke: "var(--chart-1)",
          strokeWidth: 2,
        }),
        Plot.dot(learningCurveData.filter((_, i) => i % 5 === 0), {
          x: "cycle",
          y: "time",
          fill: "var(--chart-3)",
          r: 4,
        }),
      ],
      x: { label: "Cycle Number" },
      y: { label: "Time per Unit", grid: true },
    },
    ariaLabel: "Learning curve showing time decrease over cycles",
  },
};

export const MultiLineChart: Story = {
  args: {
    options: {
      height: 300,
      marks: [
        Plot.line(breakEvenData, {
          x: "quantity",
          y: "revenue",
          stroke: "var(--chart-2)",
          strokeWidth: 2,
        }),
        Plot.line(breakEvenData, {
          x: "quantity",
          y: "totalCost",
          stroke: "var(--destructive)",
          strokeWidth: 2,
        }),
        Plot.ruleY([0]),
        Plot.text(
          [{ x: 900, y: 22500, text: "Revenue" }],
          { x: "x", y: "y", text: "text", fill: "var(--chart-2)", fontWeight: 600 }
        ),
        Plot.text(
          [{ x: 900, y: 18500, text: "Total Cost" }],
          { x: "x", y: "y", text: "text", fill: "var(--destructive)", fontWeight: 600 }
        ),
      ],
      x: { label: "Quantity" },
      y: { label: "Dollars ($)", grid: true },
    },
    ariaLabel: "Break-even chart showing revenue vs total cost",
  },
};

export const DotPlot: Story = {
  args: {
    options: {
      height: 300,
      marks: [
        Plot.dot(
          [
            { id: 1.6, mt: 320 },
            { id: 2.0, mt: 380 },
            { id: 2.3, mt: 420 },
            { id: 2.6, mt: 490 },
            { id: 3.0, mt: 540 },
            { id: 3.3, mt: 610 },
            { id: 3.6, mt: 680 },
            { id: 4.0, mt: 750 },
            { id: 4.3, mt: 830 },
          ],
          {
            x: "id",
            y: "mt",
            fill: "var(--chart-3)",
            r: 6,
          }
        ),
        Plot.linearRegressionY(
          [
            { id: 1.6, mt: 320 },
            { id: 2.0, mt: 380 },
            { id: 2.3, mt: 420 },
            { id: 2.6, mt: 490 },
            { id: 3.0, mt: 540 },
            { id: 3.3, mt: 610 },
            { id: 3.6, mt: 680 },
            { id: 4.0, mt: 750 },
            { id: 4.3, mt: 830 },
          ],
          {
            x: "id",
            y: "mt",
            stroke: "var(--chart-1)",
            strokeWidth: 2,
          }
        ),
      ],
      x: { label: "Index of Difficulty (bits)" },
      y: { label: "Movement Time (ms)", grid: true },
    },
    ariaLabel: "Fitts' Law regression showing ID vs movement time",
  },
};

/** Display the MSU color palette used in charts */
export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Categorical Palette</h3>
      <div className="flex gap-2">
        {chartPalette.categorical.map((color, i) => (
          <div key={i} className="text-center">
            <div
              className="w-12 h-12 rounded-md border border-border"
              style={{ background: color }}
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              chart-{i + 1}
            </span>
          </div>
        ))}
      </div>
      <h3 className="text-sm font-semibold">Status Colors</h3>
      <div className="flex gap-2">
        {Object.entries(chartPalette.status).map(([name, color]) => (
          <div key={name} className="text-center">
            <div
              className="w-12 h-12 rounded-md border border-border"
              style={{ background: color }}
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

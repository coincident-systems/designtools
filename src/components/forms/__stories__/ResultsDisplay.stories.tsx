import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultsDisplay } from "../ResultsDisplay";
import type { ResultItem } from "../ResultsDisplay";

/**
 * ResultsDisplay shows calculation output in either structured key-value
 * format or raw monospace text. Status coloring helps identify risk levels,
 * pass/fail conditions, and warnings.
 *
 * **VB5 Mapping:** TextBox (MultiLine=True, ReadOnly)
 *
 * **Figma Component:** `Forms / Results Display`
 */
const meta: Meta<typeof ResultsDisplay> = {
  title: "Forms/ResultsDisplay",
  component: ResultsDisplay,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResultsDisplay>;

export const Empty: Story = {
  args: {
    title: "Calculation Results",
  },
};

export const StructuredResults: Story = {
  args: {
    title: "Time Study Results",
    items: [
      { label: "Observed Time", value: "12.45", unit: "sec" },
      { label: "Normal Time", value: "13.07", unit: "sec" },
      { label: "Standard Time", value: "15.03", unit: "sec", status: "success" },
      { label: "Rating Factor", value: "1.05" },
      { label: "Pieces/Hour", value: "239.5" },
    ] satisfies ResultItem[],
  },
};

export const WithStatusColors: Story = {
  args: {
    title: "NIOSH Lifting Analysis",
    items: [
      { label: "RWL", value: "23.4", unit: "kg" },
      { label: "Lifting Index", value: "0.85", status: "success" },
      { label: "Risk Level", value: "Acceptable", status: "success" },
      { label: "Limiting Factor", value: "Horizontal Distance", status: "info" },
    ] satisfies ResultItem[],
  },
};

export const DangerResults: Story = {
  args: {
    title: "Noise Dose Assessment",
    items: [
      { label: "Total Dose", value: "142.3%", status: "danger" },
      { label: "TWA", value: "92.5", unit: "dB(A)", status: "danger" },
      { label: "Status", value: "Exceeds OSHA PEL", status: "danger" },
      { label: "Action Required", value: "Engineering Controls", status: "warning" },
    ] satisfies ResultItem[],
  },
};

export const MonospaceText: Story = {
  args: {
    title: "Detailed Breakdown",
    children: `Standard Time Calculation
========================
Observed Time:     12.45 sec
Rating Factor:      1.05 (Westinghouse)
Normal Time:       13.07 sec
Allowance:         15.0%
Standard Time:     15.03 sec

Production Rate:   239.5 pieces/hr
                   1916  pieces/shift`,
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    title: "Break-Even Analysis",
    emptyMessage: "Enter fixed costs, variable costs, and selling price to see results...",
  },
};

export const Compact: Story = {
  args: {
    title: "Quick Results",
    compact: true,
    items: [
      { label: "Sample Size", value: "384" },
      { label: "Error Limit", value: "±5.00%" },
    ] satisfies ResultItem[],
  },
};

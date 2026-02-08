import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FormSelect } from "../FormSelect";

/**
 * FormSelect provides a labeled dropdown for selecting from predefined options.
 * Used for confidence levels, rating factors, unit systems, and other
 * categorical choices throughout the calculators.
 *
 * **VB5 Mapping:** ComboBox (Style 2 - Dropdown List)
 *
 * **Figma Component:** `Forms / Select`
 */
const meta: Meta<typeof FormSelect> = {
  title: "Forms/FormSelect",
  component: FormSelect,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

const confidenceOptions = [
  { value: "0.90", label: "90%" },
  { value: "0.95", label: "95%" },
  { value: "0.99", label: "99%" },
];

const ratingOptions = [
  { value: "A1", label: "A1 - Superskill (+0.15)" },
  { value: "B1", label: "B1 - Excellent (+0.11)" },
  { value: "C1", label: "C1 - Good (+0.06)" },
  { value: "D", label: "D - Average (0.00)" },
  { value: "E1", label: "E1 - Fair (-0.05)" },
  { value: "F1", label: "F1 - Poor (-0.16)" },
];

export const Default: Story = {
  args: {
    label: "Confidence Level",
    options: confidenceOptions,
    placeholder: "Select confidence...",
  },
};

export const WithValue: Story = {
  args: {
    label: "Confidence Level",
    options: confidenceOptions,
    value: "0.95",
  },
};

export const WithError: Story = {
  args: {
    label: "Skill Rating",
    options: ratingOptions,
    error: "Please select a skill rating",
  },
};

export const WithHint: Story = {
  args: {
    label: "Duration",
    options: [
      { value: "short", label: "Short (< 1 hour)" },
      { value: "moderate", label: "Moderate (1-2 hours)" },
      { value: "long", label: "Long (2-8 hours)" },
    ],
    hint: "Duration of the lifting task",
  },
};

export const Horizontal: Story = {
  args: {
    label: "Unit System",
    options: [
      { value: "metric", label: "Metric (kg, cm)" },
      { value: "imperial", label: "Imperial (lb, in)" },
    ],
    value: "metric",
    orientation: "horizontal",
  },
};

export const Disabled: Story = {
  args: {
    label: "Locked Selection",
    options: confidenceOptions,
    value: "0.95",
    disabled: true,
  },
};

/** Interactive example with state */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-xs space-y-4">
        <FormSelect
          label="Westinghouse Skill"
          options={ratingOptions}
          value={value}
          onValueChange={setValue}
          placeholder="Select skill level..."
        />
        <p className="text-sm text-muted-foreground font-mono">
          Selected: {value || "(none)"}
        </p>
      </div>
    );
  },
};

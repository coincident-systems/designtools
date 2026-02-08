import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormInput } from "../FormInput";

/**
 * FormInput is the primary text/number input component used across all
 * DesignTools calculator modules. It wraps shadcn/ui Input with label,
 * unit display, validation errors, and hint text.
 *
 * **VB5 Mapping:** TextBox control
 *
 * **Figma Component:** `Forms / Input`
 */
const meta: Meta<typeof FormInput> = {
  title: "Forms/FormInput",
  component: FormInput,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "email", "tel"],
    },
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal"],
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "", // TODO: Add Figma frame URL when available
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

export const Default: Story = {
  args: {
    label: "Element Time",
    type: "number",
    placeholder: "Enter value...",
  },
};

export const WithUnit: Story = {
  args: {
    label: "Distance",
    type: "number",
    placeholder: "0.00",
    unit: "cm",
  },
};

export const WithHint: Story = {
  args: {
    label: "Proportion",
    type: "number",
    placeholder: "0.50",
    hint: "Enter a value between 0 and 1",
    step: "0.01",
    min: "0",
    max: "1",
  },
};

export const WithError: Story = {
  args: {
    label: "Sample Size",
    type: "number",
    value: "-5",
    error: "Sample size must be a positive integer",
  },
};

export const Horizontal: Story = {
  args: {
    label: "Frequency",
    type: "number",
    placeholder: "0.00",
    unit: "lifts/min",
    orientation: "horizontal",
  },
};

export const Disabled: Story = {
  args: {
    label: "Computed Result",
    type: "number",
    value: "42.7",
    unit: "min",
    disabled: true,
  },
};

export const TextInput: Story = {
  args: {
    label: "Element Name",
    type: "text",
    placeholder: "e.g., Pick up part",
  },
};

/** All states side by side for visual comparison */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <FormInput label="Default" type="number" placeholder="Enter value..." />
      <FormInput label="With Unit" type="number" placeholder="0.00" unit="kg" />
      <FormInput label="With Hint" type="number" hint="Between 0 and 100" />
      <FormInput label="With Error" type="number" value="-1" error="Must be positive" />
      <FormInput label="Disabled" type="number" value="42" disabled />
      <FormInput label="Horizontal" type="number" unit="dB" orientation="horizontal" />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormFrame } from "../FormFrame";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";

/**
 * FormFrame groups related form inputs under a labeled section.
 * Use it to organize logically related fields like "Westinghouse Ratings",
 * "Lifting Parameters", or "Noise Exposure Entry".
 *
 * **VB5 Mapping:** Frame control
 *
 * **Figma Component:** `Forms / Frame`
 */
const meta: Meta<typeof FormFrame> = {
  title: "Forms/FormFrame",
  component: FormFrame,
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: "radio",
      options: [1, 2, 3, 4],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormFrame>;

export const SingleColumn: Story = {
  args: {
    title: "Observation Data",
    children: (
      <>
        <FormInput label="Element Time" type="number" unit="sec" />
        <FormInput label="Observations" type="number" />
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    title: "Westinghouse Ratings",
    columns: 2,
    children: (
      <>
        <FormSelect
          label="Skill"
          options={[
            { value: "D", label: "D - Average" },
            { value: "C1", label: "C1 - Good" },
          ]}
        />
        <FormSelect
          label="Effort"
          options={[
            { value: "D", label: "D - Average" },
            { value: "C1", label: "C1 - Good" },
          ]}
        />
        <FormSelect
          label="Conditions"
          options={[
            { value: "D", label: "D - Average" },
            { value: "C", label: "C - Good" },
          ]}
        />
        <FormSelect
          label="Consistency"
          options={[
            { value: "D", label: "D - Average" },
            { value: "C", label: "C - Good" },
          ]}
        />
      </>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: "NIOSH Lifting Parameters",
    description: "Enter the physical characteristics of the lifting task",
    columns: 2,
    children: (
      <>
        <FormInput label="Horizontal Distance" type="number" unit="cm" />
        <FormInput label="Vertical Height" type="number" unit="cm" />
        <FormInput label="Travel Distance" type="number" unit="cm" />
        <FormInput label="Asymmetric Angle" type="number" unit="deg" />
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    title: "Quick Entry",
    compact: true,
    columns: 3,
    children: (
      <>
        <FormInput label="Level" type="number" unit="dB" />
        <FormInput label="Duration" type="number" unit="hrs" />
        <FormInput label="Distance" type="number" unit="ft" />
      </>
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalculateButton } from "../CalculateButton";

/**
 * CalculateButton is the primary action trigger for all calculator modules.
 * Uses MSU Gold as the accent color for high visibility. Includes loading
 * state and optional calculator icon.
 *
 * **VB5 Mapping:** CommandButton ("Calculate", "Compute")
 *
 * **Figma Component:** `Forms / Calculate Button`
 */
const meta: Meta<typeof CalculateButton> = {
  title: "Forms/CalculateButton",
  component: CalculateButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CalculateButton>;

export const Default: Story = {
  args: {
    children: "Calculate",
  },
};

export const CustomLabel: Story = {
  args: {
    children: "Compute Standard Time",
  },
};

export const Loading: Story = {
  args: {
    children: "Calculate RWL",
    loading: true,
  },
};

export const NoIcon: Story = {
  args: {
    children: "Run Analysis",
    showIcon: false,
  },
};

export const FullWidth: Story = {
  args: {
    children: "Calculate Break-Even Point",
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    children: "Calculate",
    disabled: true,
  },
};

/** All button states for visual comparison */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <CalculateButton>Default</CalculateButton>
      <CalculateButton loading>Loading</CalculateButton>
      <CalculateButton disabled>Disabled</CalculateButton>
      <CalculateButton showIcon={false}>No Icon</CalculateButton>
    </div>
  ),
};

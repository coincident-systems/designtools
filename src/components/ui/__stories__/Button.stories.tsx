import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Calculator, ArrowRight, Loader2 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Calculate",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Cancel",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Help",
    variant: "outline",
  },
};

export const Destructive: Story = {
  args: {
    children: "Clear All",
    variant: "destructive",
  },
};

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Calculator className="mr-2 h-4 w-4" />
      Calculate
    </Button>
  ),
};

export const IconRight: Story = {
  render: () => (
    <Button>
      Next Step
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Calculating...
    </Button>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

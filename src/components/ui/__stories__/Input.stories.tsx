import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "../label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter value...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="time">Element Time</Label>
      <Input id="time" type="number" placeholder="0.00" />
    </div>
  ),
};

export const WithUnit: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="time">Observed Time</Label>
      <div className="flex items-center gap-2">
        <Input id="time" type="number" placeholder="0.00" className="flex-1" />
        <span className="text-sm text-muted-foreground">minutes</span>
      </div>
    </div>
  ),
};

export const NumberInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="cycles">Number of Cycles</Label>
      <Input id="cycles" type="number" min={1} max={100} defaultValue={10} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="error" className="text-destructive">
        Sample Size
      </Label>
      <Input
        id="error"
        type="number"
        defaultValue={-5}
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">Value must be positive</p>
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="grid gap-1.5">
        <Label htmlFor="h">Horizontal Distance (H)</Label>
        <div className="flex items-center gap-2">
          <Input id="h" type="number" placeholder="0" />
          <span className="text-sm text-muted-foreground">inches</span>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="v">Vertical Distance (V)</Label>
        <div className="flex items-center gap-2">
          <Input id="v" type="number" placeholder="0" />
          <span className="text-sm text-muted-foreground">inches</span>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="d">Travel Distance (D)</Label>
        <div className="flex items-center gap-2">
          <Input id="d" type="number" placeholder="0" />
          <span className="text-sm text-muted-foreground">inches</span>
        </div>
      </div>
    </div>
  ),
};

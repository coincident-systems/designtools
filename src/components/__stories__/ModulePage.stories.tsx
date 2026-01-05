import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { ModulePage } from "../ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const meta: Meta<typeof ModulePage> = {
  title: "Layout/ModulePage",
  component: ModulePage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="p-6 bg-muted/30 min-h-screen">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyPlaceholder: Story = {
  args: {
    title: "Time Study",
    description: "Collect and analyze element times for work measurement",
    vb5Form: "frmTimeStudy",
  },
};

export const WithBackButton: Story = {
  args: {
    title: "Westinghouse Rating",
    description: "Apply Westinghouse leveling factors",
    vb5Form: "frmWesting",
    backUrl: "/time-study",
    backLabel: "Time Study",
  },
};

export const WithContent: Story = {
  args: {
    title: "Work Sampling Calculator",
    description: "Calculate required sample size for work sampling studies",
    vb5Form: "frmWSMain",
  },
  render: (args) => (
    <ModulePage {...args}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="p">Estimated Proportion (p)</Label>
              <Input id="p" type="number" placeholder="0.50" step="0.01" min="0" max="1" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="e">Desired Accuracy (e)</Label>
              <Input id="e" type="number" placeholder="0.05" step="0.01" min="0.01" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conf">Confidence Level</Label>
              <select
                id="conf"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="90">90%</option>
                <option value="95">95%</option>
                <option value="99">99%</option>
              </select>
            </div>
            <Button className="w-full">Calculate Sample Size</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="results-panel">
              {`Work Sampling Calculation
=====================================
Estimated Proportion (p): 0.50
Desired Accuracy (e):     ±5%
Confidence Level:         95%
Z-value:                  1.96

Required Sample Size:     384 observations

Formula: n = (z² × p × (1-p)) / e²
=====================================`}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePage>
  ),
};

export const WithHelp: Story = {
  args: {
    title: "NIOSH Lifting Guide",
    description: "Calculate recommended weight limit using the NIOSH lifting equation",
    vb5Form: "frmNIOSH",
    helpContent: (
      <div>
        <h3>About the NIOSH Lifting Equation</h3>
        <p>The NIOSH lifting equation calculates a Recommended Weight Limit (RWL)...</p>
      </div>
    ),
  },
};

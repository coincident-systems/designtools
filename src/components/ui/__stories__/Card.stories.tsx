import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Time Study Input</CardTitle>
        <CardDescription>Enter element times for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Westinghouse Rating</CardTitle>
        <CardDescription>Enter performance rating factors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="skill">Skill Rating</Label>
          <Input id="skill" type="number" placeholder="0.00" step="0.01" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="effort">Effort Rating</Label>
          <Input id="effort" type="number" placeholder="0.00" step="0.01" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="conditions">Conditions Rating</Label>
          <Input id="conditions" type="number" placeholder="0.00" step="0.01" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="consistency">Consistency Rating</Label>
          <Input id="consistency" type="number" placeholder="0.00" step="0.01" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Clear</Button>
        <Button>Calculate</Button>
      </CardFooter>
    </Card>
  ),
};

export const ResultsCard: Story = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Calculation Results</CardTitle>
        <CardDescription>Time study analysis output</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="results-panel">
          {`Time Study Summary
=====================================
Observed Time:     2.45 min
Performance Rating: 1.05 (105%)
Normal Time:       2.57 min
Allowance:         15%
Standard Time:     2.96 min

Element Breakdown:
  Element A: 0.82 min
  Element B: 0.91 min
  Element C: 0.72 min
=====================================`}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Export Results
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const ModuleOverview: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            ⏱
          </div>
          <div>
            <CardTitle>Time Study</CardTitle>
            <CardDescription>5 tools available</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="text-muted-foreground hover:text-primary cursor-pointer">
            Time Study
          </li>
          <li className="text-muted-foreground hover:text-primary cursor-pointer">
            Observations Input
          </li>
          <li className="text-muted-foreground hover:text-primary cursor-pointer">
            Summary
          </li>
          <li className="text-muted-foreground hover:text-primary cursor-pointer">
            Westinghouse Rating
          </li>
          <li className="text-xs text-muted-foreground">+1 more...</li>
        </ul>
      </CardContent>
    </Card>
  ),
};

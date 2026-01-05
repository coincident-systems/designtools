import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { LearningCurvesCalculator } from "../LearningCurvesCalculator";

const meta: Meta<typeof LearningCurvesCalculator> = {
  title: "Modules/Learning Curves/Calculator",
  component: LearningCurvesCalculator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Learning Curves Calculator based on the original VB5 forms \`frmLCMain\`, \`frmLCTpt\`, and \`frmLCReg\`.

## Accessibility Features
- All form inputs have associated labels
- Error messages use \`role="alert"\`
- Results use \`aria-live="polite"\` for screen reader announcements
- Descriptive hint text via \`aria-describedby\`
- Data point lists have proper ARIA roles

## Features

1. **Two-Point Method** - Calculate learning curve from two data points
   - Enter cycle numbers and corresponding times
   - Formula: \`b = log(Y2/Y1) / log(X2/X1)\`
   - Calculates learning rate, exponent, and first unit time

2. **Regression Method** - Fit learning curve to multiple data points
   - Uses least squares regression on log-transformed data
   - Provides R² value for fit quality
   - Add/remove data points dynamically

3. **Prediction** - Calculate expected time at any future cycle

## The Learning Curve Model
\`\`\`
Y = a × X^b
\`\`\`
Where:
- Y = time per unit for the Xth unit
- a = time for the first unit
- X = unit number
- b = learning exponent (negative for improvement)

## Common Learning Rates
| Rate | Exponent | Application |
|------|----------|-------------|
| 70% | -0.515 | Aerospace/Complex |
| 80% | -0.322 | Standard Industrial |
| 90% | -0.152 | Simple Tasks |
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default State",
};

export const TwoPointCalculation: Story = {
  name: "Two-Point Method",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The form should have default values already
    // Click calculate button
    const calculateButton = canvas.getByTestId("calculate-two-point");
    await userEvent.click(calculateButton);

    // Should show result
    const result = await canvas.findByTestId("two-point-result");
    expect(result).toBeInTheDocument();

    // Should display learning rate percentage
    expect(result).toHaveTextContent("%");

    // Should display exponent
    expect(result).toHaveTextContent("Exponent");
  },
};

export const TwoPointWith80PercentLearning: Story = {
  name: "80% Learning Curve (Two-Point)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // For 80% learning: doubling production reduces time to 80%
    // At cycle 50: 20 min, at cycle 100: 16 min (80% of 20)
    const x1Input = canvas.getByLabelText(/Cycle Number/i, { selector: "#tp-x1" });
    const y1Input = canvas.getByLabelText(/Time.*minutes/i, { selector: "#tp-y1" });
    const x2Input = canvas.getByLabelText(/Cycle Number/i, { selector: "#tp-x2" });
    const y2Input = canvas.getByLabelText(/Time.*minutes/i, { selector: "#tp-y2" });

    await userEvent.clear(x1Input);
    await userEvent.type(x1Input, "50");
    await userEvent.clear(y1Input);
    await userEvent.type(y1Input, "20");
    await userEvent.clear(x2Input);
    await userEvent.type(x2Input, "100");
    await userEvent.clear(y2Input);
    await userEvent.type(y2Input, "16");

    const calculateButton = canvas.getByTestId("calculate-two-point");
    await userEvent.click(calculateButton);

    const result = await canvas.findByTestId("two-point-result");
    expect(result).toBeInTheDocument();
    // Should be approximately 80%
    expect(result).toHaveTextContent(/80/);
  },
};

export const RegressionMethod: Story = {
  name: "Regression Method",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Switch to regression mode
    const regressionButton = canvas.getByRole("button", { name: /Regression Method/i });
    await userEvent.click(regressionButton);

    // Click calculate
    const calculateButton = canvas.getByTestId("calculate-regression");
    await userEvent.click(calculateButton);

    // Should show result with R²
    const result = await canvas.findByTestId("regression-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("R²");
  },
};

export const AddDataPoints: Story = {
  name: "Add Data Points (Regression)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Switch to regression mode
    const regressionButton = canvas.getByRole("button", { name: /Regression Method/i });
    await userEvent.click(regressionButton);

    // Add a new data point
    const addButton = canvas.getByTestId("add-data-point");
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // Should now have 6 data points (4 default + 2 added)
    const dataPointsList = canvas.getByRole("list", { name: /Data points/i });
    const points = within(dataPointsList).getAllByRole("listitem");
    expect(points).toHaveLength(6);
  },
};

export const ValidationError: Story = {
  name: "Input Validation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Clear and enter invalid values (second time greater than first)
    const y2Input = canvas.getByLabelText(/Time.*minutes/i, { selector: "#tp-y2" });
    await userEvent.clear(y2Input);
    await userEvent.type(y2Input, "25"); // Greater than y1=20, should fail

    // Click calculate
    const calculateButton = canvas.getByTestId("calculate-two-point");
    await userEvent.click(calculateButton);

    // Should show error
    const alert = await canvas.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/less than first/i);
  },
};

export const PredictionAtCycle: Story = {
  name: "Predict Future Time",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Enter prediction cycle
    const predictInput = canvas.getByLabelText(/Predict Time at Cycle/i, {
      selector: "#tp-predict",
    });
    await userEvent.clear(predictInput);
    await userEvent.type(predictInput, "500");

    // Calculate
    const calculateButton = canvas.getByTestId("calculate-two-point");
    await userEvent.click(calculateButton);

    // Should show prediction for cycle 500
    const result = await canvas.findByTestId("two-point-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("Predicted Time at Cycle 500");
  },
};

export const KeyboardNavigation: Story = {
  name: "Keyboard Accessible",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus first input
    const x1Input = canvas.getByLabelText(/Cycle Number/i, { selector: "#tp-x1" });
    x1Input.focus();
    expect(x1Input).toHaveFocus();

    // Tab through inputs
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    // Should reach calculate button
    const calculateButton = canvas.getByTestId("calculate-two-point");
    expect(calculateButton).toHaveFocus();

    // Press Enter to calculate
    await userEvent.keyboard("{Enter}");

    // Should show result
    const result = await canvas.findByTestId("two-point-result");
    expect(result).toBeInTheDocument();
  },
};

export const MobileView: Story = {
  name: "Mobile Responsive",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "The calculator adapts to mobile screens with stacked layout.",
      },
    },
  },
};

export const ReferenceTable: Story = {
  name: "Learning Rate Reference",
  parameters: {
    docs: {
      description: {
        story:
          "The calculator includes a reference table showing common learning rates and their corresponding exponents for different industries.",
      },
    },
  },
};

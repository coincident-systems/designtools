import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { WorkSamplingCalculator } from "../WorkSamplingCalculator";

const meta: Meta<typeof WorkSamplingCalculator> = {
  title: "Modules/Work Sampling/Calculator",
  component: WorkSamplingCalculator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Work Sampling Calculator based on the original VB5 form \`frmWSMain\`.

## Accessibility Features
- All form inputs have associated labels
- Error messages use \`role="alert"\`
- Results use \`aria-live="polite"\` for screen reader announcements
- Descriptive hint text via \`aria-describedby\`
- Icons marked as \`aria-hidden\`

## Features

1. **Calculate Sample Size (n)** - Determine required observations given:
   - Probability of occurrence (p)
   - Confidence level (1-α)
   - Desired error limit (l)
   - Formula: \`n = (z² × p × (1-p)) / l²\`

2. **Calculate Error Limit (l)** - Determine achievable accuracy given:
   - Probability of occurrence (p)
   - Confidence level (1-α)
   - Available sample size (n)
   - Formula: \`l = z × √(p × (1-p) / n)\`

3. **Generate Random Times** - Create randomized observation schedule

## Common Z-Values
| Confidence | α | z-value |
|------------|---|---------|
| 90% | 0.10 | 1.645 |
| 95% | 0.05 | 1.960 |
| 99% | 0.01 | 2.576 |
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

export const CalculateSampleSize: Story = {
  name: "Calculate Sample Size",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The form should have default values already
    // Click calculate button
    const calculateButton = canvas.getByTestId("calculate-sample-size");
    await userEvent.click(calculateButton);

    // Should show result (default values: p=0.5, 95%, l=0.05 → n=385)
    const result = await canvas.findByTestId("sample-size-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("n = 385");
  },
};

export const CalculateErrorLimit: Story = {
  name: "Calculate Error Limit",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click calculate button for error limit
    const calculateButton = canvas.getByTestId("calculate-error-limit");
    await userEvent.click(calculateButton);

    // Should show result (default values: p=0.5, 95%, n=384 → l≈5%)
    const result = await canvas.findByTestId("error-limit-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("±");
  },
};

export const GenerateRandomTimes: Story = {
  name: "Generate Random Observation Times",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click generate button
    const generateButton = canvas.getByTestId("generate-times");
    await userEvent.click(generateButton);

    // Should show list of times
    const result = await canvas.findByTestId("random-times-result");
    expect(result).toBeInTheDocument();

    // Should have 10 times (default count)
    const timeItems = within(result).getAllByRole("listitem");
    expect(timeItems).toHaveLength(10);
  },
};

export const ValidationErrors: Story = {
  name: "Input Validation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Clear the probability input and enter invalid value
    const pInput = canvas.getByLabelText(/Probability of occurrence/i, {
      selector: "#ss-p",
    });
    await userEvent.clear(pInput);
    await userEvent.type(pInput, "1.5");

    // Click calculate
    const calculateButton = canvas.getByTestId("calculate-sample-size");
    await userEvent.click(calculateButton);

    // Should show error
    const alert = await canvas.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/must be between 0 and 1/i);
  },
};

export const HighConfidenceScenario: Story = {
  name: "99% Confidence Requires More Samples",
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates that higher confidence levels require more samples. With 99% confidence, the same study requires significantly more observations than 95%.",
      },
    },
  },
};

export const LowVariabilityScenario: Story = {
  name: "Low Variability Study",
  parameters: {
    docs: {
      description: {
        story:
          "When the estimated proportion is near 0 or 1 (low variability), fewer samples are needed. This demonstrates the mathematical relationship p(1-p) where extreme values reduce sample requirements.",
      },
    },
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
        story: "The calculator adapts to mobile screens with a single-column layout.",
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  name: "Keyboard Accessible",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus first input
    const pInput = canvas.getByLabelText(/Probability of occurrence/i, {
      selector: "#ss-p",
    });
    pInput.focus();
    expect(pInput).toHaveFocus();

    // Tab to next input
    await userEvent.tab();
    // Should be on confidence select trigger

    // Tab to z-value display (skipped, not focusable)
    await userEvent.tab();
    // Should be on error limit input

    await userEvent.tab();
    // Should be on calculate button
    const calculateButton = canvas.getByTestId("calculate-sample-size");
    expect(calculateButton).toHaveFocus();

    // Press Enter to calculate
    await userEvent.keyboard("{Enter}");

    // Should show result
    const result = await canvas.findByTestId("sample-size-result");
    expect(result).toBeInTheDocument();
  },
};

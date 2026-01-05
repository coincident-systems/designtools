import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { NoiseDoseCalculator } from "../NoiseDoseCalculator";

const meta: Meta<typeof NoiseDoseCalculator> = {
  title: "Modules/Ergonomics/Noise Dose Calculator",
  component: NoiseDoseCalculator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
OSHA Noise Dose Calculator based on 29 CFR 1910.95.

## Accessibility Features
- All form inputs have associated labels
- Error messages use \`role="alert"\`
- Results use \`aria-live="polite"\` for screen reader announcements
- Color-coded results also include icon and text indicators
- Reference table has proper table semantics

## OSHA Noise Standards

The Permissible Exposure Limit (PEL) is:
- 90 dB(A) for 8 hours
- For every 5 dB increase, allowed time is halved (5 dB exchange rate)

### Key Formulas
- **Allowed Time**: T = 8 / 2^((L-90)/5) hours
- **Noise Dose**: D = Σ(C/T) × 100%
- **TWA**: 16.61 × log10(D/100) + 90

### Thresholds
| Dose | Status |
|------|--------|
| < 50% | Safe |
| 50-100% | Action Level (hearing conservation required) |
| > 100% | Exceeds PEL (engineering controls required) |
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

export const Calculate100PercentDose: Story = {
  name: "100% Dose (PEL)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Default values should calculate close to 100% dose
    const calculateButton = canvas.getByTestId("calculate-noise-dose");
    await userEvent.click(calculateButton);

    const result = await canvas.findByTestId("noise-dose-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("%");
    expect(result).toHaveTextContent("TWA");
  },
};

export const ExceedsPEL: Story = {
  name: "Exceeds PEL (150%+)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Update first exposure to high level
    const levelInputs = canvas.getAllByRole("spinbutton", { name: /noise level/i });
    const durationInputs = canvas.getAllByRole("spinbutton", { name: /duration/i });

    await userEvent.clear(levelInputs[0]);
    await userEvent.type(levelInputs[0], "100");
    await userEvent.clear(durationInputs[0]);
    await userEvent.type(durationInputs[0], "4");

    await userEvent.clear(levelInputs[1]);
    await userEvent.type(levelInputs[1], "95");
    await userEvent.clear(durationInputs[1]);
    await userEvent.type(durationInputs[1], "4");

    const calculateButton = canvas.getByTestId("calculate-noise-dose");
    await userEvent.click(calculateButton);

    const result = await canvas.findByTestId("noise-dose-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("Exceeds");
  },
};

export const SafeLevel: Story = {
  name: "Below Action Level",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Set low exposure
    const levelInputs = canvas.getAllByRole("spinbutton", { name: /noise level/i });
    const durationInputs = canvas.getAllByRole("spinbutton", { name: /duration/i });

    await userEvent.clear(levelInputs[0]);
    await userEvent.type(levelInputs[0], "85");
    await userEvent.clear(durationInputs[0]);
    await userEvent.type(durationInputs[0], "4");

    await userEvent.clear(durationInputs[1]);
    await userEvent.type(durationInputs[1], "0");

    const calculateButton = canvas.getByTestId("calculate-noise-dose");
    await userEvent.click(calculateButton);

    const result = await canvas.findByTestId("noise-dose-result");
    expect(result).toBeInTheDocument();
    expect(result).toHaveTextContent("Acceptable");
  },
};

export const AddExposures: Story = {
  name: "Add Multiple Exposures",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Add more exposures
    const addButton = canvas.getByTestId("add-exposure");
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // Should now have 4 entries
    const exposureList = canvas.getByRole("list", { name: /exposure entries/i });
    const items = within(exposureList).getAllByRole("listitem");
    expect(items).toHaveLength(4);
  },
};

export const ValidationError: Story = {
  name: "Validation Error",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Clear all inputs
    const durationInputs = canvas.getAllByRole("spinbutton", { name: /duration/i });
    await userEvent.clear(durationInputs[0]);
    await userEvent.type(durationInputs[0], "0");
    await userEvent.clear(durationInputs[1]);
    await userEvent.type(durationInputs[1], "0");

    const calculateButton = canvas.getByTestId("calculate-noise-dose");
    await userEvent.click(calculateButton);

    const alert = await canvas.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/valid/i);
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
  name: "OSHA Reference Table",
  parameters: {
    docs: {
      description: {
        story:
          "The calculator includes a reference table from OSHA Table G-16 showing permissible noise exposures.",
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  name: "Keyboard Accessible",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus first input
    const levelInputs = canvas.getAllByRole("spinbutton", { name: /noise level/i });
    levelInputs[0].focus();
    expect(levelInputs[0]).toHaveFocus();

    // Tab through form
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    // Should reach calculate button
    const calculateButton = canvas.getByTestId("calculate-noise-dose");
    expect(calculateButton).toHaveFocus();

    // Press Enter to calculate
    await userEvent.keyboard("{Enter}");

    // Should show result
    const result = await canvas.findByTestId("noise-dose-result");
    expect(result).toBeInTheDocument();
  },
};

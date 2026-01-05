import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { ThemeToggle } from "../ThemeToggle";
import { ThemeProvider } from "@/contexts/theme-context";

// Wrapper to provide theme context
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>;
}

const meta: Meta<typeof ThemeToggle> = {
  title: "Components/Theme Toggle",
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <ThemeWrapper>
        <div className="p-8 bg-background text-foreground min-h-[200px]">
          <Story />
        </div>
      </ThemeWrapper>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Theme toggle component for switching between light, dark, and system themes.

## Features
- Three-state toggle: Light → Dark → System → Light
- Persists preference to localStorage
- Respects system preference when set to "System"
- Accessible with ARIA labels
- Shows tooltip with current theme name

## Accessibility
- Announces current theme and next action to screen readers
- Keyboard accessible (Space/Enter to toggle)
- Focus ring visible on keyboard navigation
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Icon Only (Default)",
};

export const WithLabel: Story = {
  name: "With Label",
  args: {
    showLabel: true,
  },
};

export const SmallSize: Story = {
  name: "Small Size",
  args: {
    size: "sm",
  },
};

export const LargeSize: Story = {
  name: "Large Size",
  args: {
    size: "lg",
    showLabel: true,
  },
};

export const CycleThemes: Story = {
  name: "Theme Cycling",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByTestId("theme-toggle");
    expect(toggle).toBeInTheDocument();

    // Initial state should be light (sun icon)
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("Light"));

    // Click to go to dark
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("Dark"));

    // Click to go to system
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("System"));

    // Click to go back to light
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("Light"));
  },
};

export const KeyboardAccessible: Story = {
  name: "Keyboard Navigation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByTestId("theme-toggle");

    // Focus the toggle
    toggle.focus();
    expect(toggle).toHaveFocus();

    // Press Enter to toggle
    await userEvent.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("Dark"));

    // Press Space to toggle again
    await userEvent.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-label", expect.stringContaining("System"));
  },
};

export const InDarkMode: Story = {
  name: "In Dark Theme",
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <div className="p-8 bg-background text-foreground min-h-[200px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    themes: {
      themeOverride: "dark",
    },
  },
};

export const InHeader: Story = {
  name: "In Header Context",
  decorators: [
    (Story) => (
      <ThemeWrapper>
        <header className="flex items-center justify-between p-4 border-b bg-background">
          <h1 className="text-lg font-semibold text-foreground">DesignTools</h1>
          <Story />
        </header>
      </ThemeWrapper>
    ),
  ],
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, waitFor } from "@storybook/test";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "../AppLayout";

// Wrapper to provide router context for stories
function StoryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={children}>
          <Route index element={<div className="p-4">Home Content</div>} />
          <Route path="time-study" element={<div className="p-4">Time Study Content</div>} />
          <Route path="*" element={<div className="p-4">Page Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const meta: Meta<typeof AppLayout> = {
  title: "Layouts/App Layout",
  component: AppLayout,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The main application layout with responsive navigation.

## Features
- **Desktop**: Collapsible sidebar with grouped navigation
- **Mobile**: Bottom sheet drawer with touch-friendly design
- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management

## Mobile Navigation
The mobile navigation slides up from the bottom as a sheet overlay:
- Drag handle indicator for touch feedback
- Collapsible sections for navigation categories
- Closes automatically on navigation
- 85vh height for comfortable scrolling

## Desktop Sidebar
Full-height sidebar with:
- Logo and app branding
- Home link
- Categorized navigation groups
- Tooltips on hover
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  name: "Desktop View",
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: "Desktop view shows the full sidebar navigation.",
      },
    },
  },
};

export const Mobile: Story = {
  name: "Mobile View",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Mobile view shows a hamburger menu that opens a bottom sheet.",
      },
    },
  },
};

export const MobileMenuOpen: Story = {
  name: "Mobile Menu Interaction",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click the mobile menu trigger
    const menuTrigger = canvas.getByTestId("mobile-menu-trigger");
    expect(menuTrigger).toBeInTheDocument();

    await userEvent.click(menuTrigger);

    // Wait for the sheet to open (look in document body for portaled content)
    await waitFor(async () => {
      const menuContent = document.querySelector('[data-testid="mobile-menu-content"]');
      expect(menuContent).toBeInTheDocument();
    });

    // Verify key elements are present
    const body = within(document.body);
    expect(body.getByText("DesignTools")).toBeInTheDocument();
    expect(body.getByText("Home")).toBeInTheDocument();
  },
};

export const MobileMenuExpand: Story = {
  name: "Expand Navigation Section",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open mobile menu
    const menuTrigger = canvas.getByTestId("mobile-menu-trigger");
    await userEvent.click(menuTrigger);

    // Wait for menu to open
    await waitFor(async () => {
      const menuContent = document.querySelector('[data-testid="mobile-menu-content"]');
      expect(menuContent).toBeInTheDocument();
    });

    const body = within(document.body);

    // Find a collapsible section (e.g., "Time Study")
    const timeStudySection = body.getByRole("button", { name: /time study/i });
    expect(timeStudySection).toBeInTheDocument();

    // Click to expand
    await userEvent.click(timeStudySection);

    // Verify it expanded (should show sub-items)
    await waitFor(() => {
      expect(timeStudySection).toHaveAttribute("aria-expanded", "true");
    });
  },
};

export const MobileMenuKeyboard: Story = {
  name: "Keyboard Navigation",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "The mobile menu is fully keyboard accessible.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus and activate menu trigger with keyboard
    const menuTrigger = canvas.getByTestId("mobile-menu-trigger");
    menuTrigger.focus();
    expect(menuTrigger).toHaveFocus();

    // Press Enter to open
    await userEvent.keyboard("{Enter}");

    // Wait for menu to open
    await waitFor(async () => {
      const menuContent = document.querySelector('[data-testid="mobile-menu-content"]');
      expect(menuContent).toBeInTheDocument();
    });

    // Press Escape to close
    await userEvent.keyboard("{Escape}");

    // Menu should close
    await waitFor(async () => {
      const menuContent = document.querySelector('[data-testid="mobile-menu-content"]');
      expect(menuContent).not.toBeInTheDocument();
    });
  },
};

export const Tablet: Story = {
  name: "Tablet View",
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "At tablet sizes (768px), the layout switches to mobile navigation.",
      },
    },
  },
};

export const DesktopSidebarNavigation: Story = {
  name: "Desktop Sidebar Active State",
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: "Desktop sidebar shows active state for current page.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Home link should be active
    const homeLink = canvas.getByRole("link", { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("aria-current", "page");
  },
};

export const HeaderBranding: Story = {
  name: "Header Content",
  parameters: {
    docs: {
      description: {
        story: "The header shows page title on mobile and app version info on desktop.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should have app info in header
    expect(canvas.getByText(/DesignTools/)).toBeInTheDocument();
  },
};

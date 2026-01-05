import { describe, it, expect } from "vitest";

/**
 * Color Contrast Accessibility Tests
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text: 4.5:1 minimum contrast ratio
 * - Large text (18pt+ or 14pt bold): 3:1 minimum contrast ratio
 * - UI components and graphical objects: 3:1 minimum contrast ratio
 *
 * WCAG 2.1 AAA Requirements (aspirational):
 * - Normal text: 7:1 minimum contrast ratio
 * - Large text: 4.5:1 minimum contrast ratio
 */

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Calculate relative luminance per WCAG 2.1
function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio per WCAG 2.1
function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Theme color definitions
const lightTheme = {
  background: "#ffffff",
  foreground: "#343a40",
  card: "#ffffff",
  cardForeground: "#343a40",
  primary: "#28518F",
  primaryForeground: "#ffffff",
  secondary: "#007a8c",
  secondaryForeground: "#ffffff",
  muted: "#f8f9fa",
  mutedForeground: "#6c757d",
  accent: "#E6DBA1",
  accentForeground: "#1a3660",
  destructive: "#dc3545",
  border: "#dee2e6",
  sidebarBackground: "#1a3660",
  sidebarForeground: "#ffffff",
  sidebarPrimary: "#E6DBA1",
};

const darkTheme = {
  background: "#0d1a2d",
  foreground: "#e8edf3",
  card: "#132238",
  cardForeground: "#e8edf3",
  primary: "#5d8fd4",
  primaryForeground: "#0d1a2d",
  secondary: "#00c4d9",
  secondaryForeground: "#0d1a2d",
  muted: "#1c2f47",
  mutedForeground: "#a3b3c6",
  accent: "#E6DBA1",
  accentForeground: "#0d1a2d",
  destructive: "#f87171",
  border: "#2a4060",
  sidebarBackground: "#091322",
  sidebarForeground: "#e8edf3",
  sidebarPrimary: "#E6DBA1",
};

describe("Color Contrast - WCAG 2.1 AA Compliance", () => {
  describe("Light Theme", () => {
    it("foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.foreground, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("muted-foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.mutedForeground, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("primary on background meets AA for large text (3:1)", () => {
      const ratio = getContrastRatio(lightTheme.primary, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("primary-foreground on primary meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.primaryForeground, lightTheme.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("secondary-foreground on secondary meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.secondaryForeground, lightTheme.secondary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("accent-foreground on accent meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.accentForeground, lightTheme.accent);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("destructive on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.destructive, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sidebar-foreground on sidebar meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.sidebarForeground, lightTheme.sidebarBackground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sidebar-primary on sidebar meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.sidebarPrimary, lightTheme.sidebarBackground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Dark Theme", () => {
    it("foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.foreground, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("muted-foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.mutedForeground, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("primary on background meets AA for large text (3:1)", () => {
      const ratio = getContrastRatio(darkTheme.primary, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("primary-foreground on primary meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.primaryForeground, darkTheme.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("secondary-foreground on secondary meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.secondaryForeground, darkTheme.secondary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("accent on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.accent, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("accent-foreground on accent meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.accentForeground, darkTheme.accent);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("destructive on background meets AA for large text (3:1)", () => {
      const ratio = getContrastRatio(darkTheme.destructive, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("card-foreground on card meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.cardForeground, darkTheme.card);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sidebar-foreground on sidebar meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.sidebarForeground, darkTheme.sidebarBackground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("sidebar-primary on sidebar meets AAA for large text (4.5:1)", () => {
      const ratio = getContrastRatio(darkTheme.sidebarPrimary, darkTheme.sidebarBackground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Utility Functions", () => {
    it("correctly calculates white/black contrast (21:1)", () => {
      const ratio = getContrastRatio("#ffffff", "#000000");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("correctly calculates same color contrast (1:1)", () => {
      const ratio = getContrastRatio("#808080", "#808080");
      expect(ratio).toBeCloseTo(1, 1);
    });

    it("throws for invalid hex colors", () => {
      expect(() => hexToRgb("invalid")).toThrow();
      expect(() => hexToRgb("#gg0000")).toThrow();
    });
  });
});

describe("Color Contrast - Reported Ratios", () => {
  it("logs all contrast ratios for verification", () => {
    const ratios = {
      light: {
        "foreground/background": getContrastRatio(
          lightTheme.foreground,
          lightTheme.background
        ).toFixed(1),
        "mutedForeground/background": getContrastRatio(
          lightTheme.mutedForeground,
          lightTheme.background
        ).toFixed(1),
        "primary/background": getContrastRatio(
          lightTheme.primary,
          lightTheme.background
        ).toFixed(1),
        "destructive/background": getContrastRatio(
          lightTheme.destructive,
          lightTheme.background
        ).toFixed(1),
      },
      dark: {
        "foreground/background": getContrastRatio(
          darkTheme.foreground,
          darkTheme.background
        ).toFixed(1),
        "mutedForeground/background": getContrastRatio(
          darkTheme.mutedForeground,
          darkTheme.background
        ).toFixed(1),
        "primary/background": getContrastRatio(
          darkTheme.primary,
          darkTheme.background
        ).toFixed(1),
        "destructive/background": getContrastRatio(
          darkTheme.destructive,
          darkTheme.background
        ).toFixed(1),
        "accent/background": getContrastRatio(
          darkTheme.accent,
          darkTheme.background
        ).toFixed(1),
      },
    };

    // This test always passes, it's just for visibility
    console.log("Contrast Ratios:", JSON.stringify(ratios, null, 2));
    expect(true).toBe(true);
  });
});

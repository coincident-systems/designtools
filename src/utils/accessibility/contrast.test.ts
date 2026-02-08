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
 *
 * MSU Brand Colors:
 * - MSU Blue: #162960
 * - MSU Gold: #f4b425
 * - MSU Gold Light: #fada92
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

// Theme color definitions -- MSU Brand
const lightTheme = {
  background: "#ffffff",
  foreground: "#1c1c1e",
  card: "#ffffff",
  cardForeground: "#1c1c1e",
  primary: "#162960",
  primaryForeground: "#ffffff",
  secondary: "#007a8c",
  secondaryForeground: "#ffffff",
  muted: "#f5f5f7",
  mutedForeground: "#6c6c70",
  accent: "#f4b425",
  accentForeground: "#0f1d45",
  destructive: "#dc3545",
  border: "#d1d1d6",
  sidebarBackground: "#162960",
  sidebarForeground: "#ffffff",
  sidebarPrimary: "#f4b425",
};

const darkTheme = {
  background: "#0b1530",
  foreground: "#e8ecf4",
  card: "#111e3a",
  cardForeground: "#e8ecf4",
  primary: "#4a7fd6",
  primaryForeground: "#0b1530",
  secondary: "#00c4d9",
  secondaryForeground: "#0b1530",
  muted: "#172545",
  mutedForeground: "#9ca3b4",
  accent: "#f4b425",
  accentForeground: "#0b1530",
  destructive: "#f87171",
  border: "#243860",
  sidebarBackground: "#060e1c",
  sidebarForeground: "#e8ecf4",
  sidebarPrimary: "#f4b425",
};

describe("Color Contrast - WCAG 2.1 AA Compliance", () => {
  describe("Light Theme (MSU Brand)", () => {
    it("foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.foreground, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("muted-foreground on background meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.mutedForeground, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("primary (MSU Blue) on background meets AA for large text (3:1)", () => {
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

    it("accent-foreground on accent (MSU Gold) meets AA for normal text (4.5:1)", () => {
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

    it("sidebar-primary (gold) on sidebar (MSU Blue) meets AA for normal text (4.5:1)", () => {
      const ratio = getContrastRatio(lightTheme.sidebarPrimary, lightTheme.sidebarBackground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Dark Theme (MSU Brand)", () => {
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

    it("accent (MSU Gold) on background meets AA for normal text (4.5:1)", () => {
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

    it("sidebar-primary (gold) on sidebar meets AAA for large text (4.5:1)", () => {
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
        "primary(MSU Blue)/background": getContrastRatio(
          lightTheme.primary,
          lightTheme.background
        ).toFixed(1),
        "destructive/background": getContrastRatio(
          lightTheme.destructive,
          lightTheme.background
        ).toFixed(1),
        "sidebarPrimary(gold)/sidebar(blue)": getContrastRatio(
          lightTheme.sidebarPrimary,
          lightTheme.sidebarBackground
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
        "accent(gold)/background": getContrastRatio(
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

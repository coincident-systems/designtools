/**
 * Pareto Analysis (80/20 Rule)
 * Based on Niebel & Freivalds quality concepts
 *
 * The Pareto Principle states that roughly 80% of effects
 * come from 20% of causes. Used for prioritizing improvement efforts.
 */

export interface ParetoItem {
  id: string;
  category: string;
  value: number;
}

export interface ParetoResult {
  items: ParetoAnalyzedItem[];
  totalValue: number;
  vitalFewThreshold: number;
  vitalFewCount: number;
  vitalFewCategories: string[];
  vitalFewPercentage: number;
  trivialManyCount: number;
}

export interface ParetoAnalyzedItem extends ParetoItem {
  percentage: number;
  cumulativeValue: number;
  cumulativePercentage: number;
  isVitalFew: boolean;
  rank: number;
}

/**
 * Analyze data for Pareto chart
 * Returns items sorted by value with cumulative percentages
 */
export function analyzePareto(
  items: ParetoItem[],
  vitalFewThreshold: number = 80
): ParetoResult {
  if (items.length === 0) {
    return {
      items: [],
      totalValue: 0,
      vitalFewThreshold,
      vitalFewCount: 0,
      vitalFewCategories: [],
      vitalFewPercentage: 0,
      trivialManyCount: 0,
    };
  }

  // Calculate total
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  // Sort by value descending
  const sorted = [...items].sort((a, b) => b.value - a.value);

  // Calculate percentages and cumulative values
  let cumulativeValue = 0;
  let vitalFewCount = 0;
  const vitalFewCategories: string[] = [];

  const analyzedItems: ParetoAnalyzedItem[] = sorted.map((item, index) => {
    cumulativeValue += item.value;
    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    const cumulativePercentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;

    // Determine if this is part of the "vital few"
    // An item is vital few if adding it doesn't exceed threshold, or if it's the first item
    const isVitalFew = cumulativePercentage <= vitalFewThreshold || index === 0;

    if (isVitalFew && cumulativePercentage <= vitalFewThreshold) {
      vitalFewCount++;
      vitalFewCategories.push(item.category);
    }

    return {
      ...item,
      percentage,
      cumulativeValue,
      cumulativePercentage,
      isVitalFew,
      rank: index + 1,
    };
  });

  // If first item exceeds threshold, count it as vital few
  if (vitalFewCount === 0 && analyzedItems.length > 0) {
    vitalFewCount = 1;
    vitalFewCategories.push(analyzedItems[0].category);
    analyzedItems[0].isVitalFew = true;
  }

  const vitalFewPercentage =
    totalValue > 0 && vitalFewCount > 0
      ? (analyzedItems
          .slice(0, vitalFewCount)
          .reduce((sum, item) => sum + item.value, 0) /
          totalValue) *
        100
      : 0;

  return {
    items: analyzedItems,
    totalValue,
    vitalFewThreshold,
    vitalFewCount,
    vitalFewCategories,
    vitalFewPercentage,
    trivialManyCount: items.length - vitalFewCount,
  };
}

/**
 * Format value with appropriate units
 */
export function formatParetoValue(value: number, unit: string = ""): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit ? " " + unit : ""}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit ? " " + unit : ""}`;
  }
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}${unit ? " " + unit : ""}`;
}

/**
 * Generate sample Pareto data for demonstration
 */
export function generateSampleData(): ParetoItem[] {
  return [
    { id: "1", category: "Machine Breakdown", value: 42 },
    { id: "2", category: "Material Defects", value: 28 },
    { id: "3", category: "Operator Error", value: 15 },
    { id: "4", category: "Tool Wear", value: 8 },
    { id: "5", category: "Setup Issues", value: 4 },
    { id: "6", category: "Documentation", value: 2 },
    { id: "7", category: "Other", value: 1 },
  ];
}

/**
 * Calculate the ideal number of vital few categories
 * based on Pareto principle (typically 20% of categories)
 */
export function getIdealVitalFewCount(totalCategories: number): number {
  return Math.max(1, Math.ceil(totalCategories * 0.2));
}

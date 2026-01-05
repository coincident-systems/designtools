/**
 * Break-Even Analysis Calculator
 * Based on Niebel & Freivalds, Chapter 2
 *
 * Break-even point is where Total Revenue = Total Costs
 * Revenue = Price × Quantity
 * Total Cost = Fixed Costs + (Variable Cost per Unit × Quantity)
 *
 * At break-even: P × Q = FC + (VC × Q)
 * Solving for Q: Q = FC / (P - VC)
 */

export interface BreakEvenInputs {
  /** Fixed costs (rent, salaries, equipment, etc.) */
  fixedCosts: number;
  /** Variable cost per unit (materials, labor per unit, etc.) */
  variableCostPerUnit: number;
  /** Selling price per unit */
  sellingPricePerUnit: number;
  /** Optional: Target profit amount */
  targetProfit?: number;
}

export interface BreakEvenResult {
  /** Break-even quantity (units) */
  breakEvenQuantity: number;
  /** Break-even revenue ($) */
  breakEvenRevenue: number;
  /** Contribution margin per unit */
  contributionMargin: number;
  /** Contribution margin ratio (%) */
  contributionMarginRatio: number;
  /** Quantity needed for target profit */
  targetProfitQuantity?: number;
  /** Revenue needed for target profit */
  targetProfitRevenue?: number;
  /** Margin of safety (if current quantity provided) */
  marginOfSafety?: number;
  /** Is the business model viable? */
  isViable: boolean;
  /** Analysis message */
  analysis: string;
}

export interface BreakEvenChartPoint {
  quantity: number;
  revenue: number;
  totalCost: number;
  fixedCost: number;
  profit: number;
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const { fixedCosts, variableCostPerUnit, sellingPricePerUnit, targetProfit } = inputs;

  // Contribution margin = Selling Price - Variable Cost
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;

  // Contribution margin ratio
  const contributionMarginRatio =
    sellingPricePerUnit > 0 ? (contributionMargin / sellingPricePerUnit) * 100 : 0;

  // Check viability
  if (contributionMargin <= 0) {
    return {
      breakEvenQuantity: Infinity,
      breakEvenRevenue: Infinity,
      contributionMargin,
      contributionMarginRatio,
      isViable: false,
      analysis:
        contributionMargin === 0
          ? "Selling price equals variable cost. No profit possible regardless of volume."
          : "Variable cost exceeds selling price. Every unit sold increases losses.",
    };
  }

  // Break-even quantity
  const breakEvenQuantity = fixedCosts / contributionMargin;

  // Break-even revenue
  const breakEvenRevenue = breakEvenQuantity * sellingPricePerUnit;

  // Target profit calculations
  let targetProfitQuantity: number | undefined;
  let targetProfitRevenue: number | undefined;

  if (targetProfit !== undefined && targetProfit > 0) {
    targetProfitQuantity = (fixedCosts + targetProfit) / contributionMargin;
    targetProfitRevenue = targetProfitQuantity * sellingPricePerUnit;
  }

  // Analysis message
  let analysis = `Break-even at ${Math.ceil(breakEvenQuantity).toLocaleString()} units. `;
  analysis += `Each unit contributes $${contributionMargin.toFixed(2)} toward fixed costs and profit. `;

  if (contributionMarginRatio >= 50) {
    analysis += "Strong contribution margin ratio indicates good pricing power.";
  } else if (contributionMarginRatio >= 25) {
    analysis += "Moderate contribution margin. Consider ways to reduce variable costs.";
  } else {
    analysis += "Low contribution margin requires high volume to be profitable.";
  }

  return {
    breakEvenQuantity,
    breakEvenRevenue,
    contributionMargin,
    contributionMarginRatio,
    targetProfitQuantity,
    targetProfitRevenue,
    isViable: true,
    analysis,
  };
}

/**
 * Generate data points for break-even chart
 */
export function generateBreakEvenChartData(
  inputs: BreakEvenInputs,
  maxQuantity?: number
): BreakEvenChartPoint[] {
  const result = calculateBreakEven(inputs);

  if (!result.isViable) {
    maxQuantity = maxQuantity || 100;
  } else {
    // Show chart up to 2x break-even or provided max
    maxQuantity = maxQuantity || Math.ceil(result.breakEvenQuantity * 2);
  }

  const points: BreakEvenChartPoint[] = [];
  const step = Math.max(1, Math.floor(maxQuantity / 20));

  for (let q = 0; q <= maxQuantity; q += step) {
    points.push({
      quantity: q,
      revenue: q * inputs.sellingPricePerUnit,
      totalCost: inputs.fixedCosts + q * inputs.variableCostPerUnit,
      fixedCost: inputs.fixedCosts,
      profit: q * inputs.sellingPricePerUnit - (inputs.fixedCosts + q * inputs.variableCostPerUnit),
    });
  }

  return points;
}

/**
 * Calculate profit/loss at a given quantity
 */
export function calculateProfitAtQuantity(inputs: BreakEvenInputs, quantity: number): number {
  const revenue = quantity * inputs.sellingPricePerUnit;
  const totalCost = inputs.fixedCosts + quantity * inputs.variableCostPerUnit;
  return revenue - totalCost;
}

/**
 * Calculate margin of safety
 * Margin of Safety = (Current Sales - Break-even Sales) / Current Sales × 100
 */
export function calculateMarginOfSafety(
  currentQuantity: number,
  breakEvenQuantity: number
): number {
  if (currentQuantity <= 0) return 0;
  return ((currentQuantity - breakEvenQuantity) / currentQuantity) * 100;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compare two scenarios (e.g., make vs buy)
 */
export interface ScenarioComparison {
  scenario1: BreakEvenInputs & { name: string };
  scenario2: BreakEvenInputs & { name: string };
}

export function compareScenarios(comparison: ScenarioComparison): {
  crossoverQuantity: number;
  preferScenario1Below: boolean;
  analysis: string;
} {
  const { scenario1, scenario2 } = comparison;

  // Find crossover point where total costs are equal
  // FC1 + VC1*Q = FC2 + VC2*Q
  // Q = (FC2 - FC1) / (VC1 - VC2)

  const fixedDiff = scenario2.fixedCosts - scenario1.fixedCosts;
  const varDiff = scenario1.variableCostPerUnit - scenario2.variableCostPerUnit;

  if (varDiff === 0) {
    // Parallel cost lines - one is always better
    const preferScenario1 = scenario1.fixedCosts < scenario2.fixedCosts;
    return {
      crossoverQuantity: Infinity,
      preferScenario1Below: preferScenario1,
      analysis: `${preferScenario1 ? scenario1.name : scenario2.name} is always preferred (same variable costs, lower fixed costs).`,
    };
  }

  const crossoverQuantity = fixedDiff / varDiff;

  if (crossoverQuantity < 0) {
    // Crossover is negative - one option always better
    const preferScenario1 =
      scenario1.fixedCosts + scenario1.variableCostPerUnit <
      scenario2.fixedCosts + scenario2.variableCostPerUnit;
    return {
      crossoverQuantity: 0,
      preferScenario1Below: preferScenario1,
      analysis: `${preferScenario1 ? scenario1.name : scenario2.name} is always preferred at positive quantities.`,
    };
  }

  const preferScenario1Below = scenario1.variableCostPerUnit > scenario2.variableCostPerUnit;

  return {
    crossoverQuantity,
    preferScenario1Below,
    analysis: `Below ${Math.ceil(crossoverQuantity).toLocaleString()} units, ${preferScenario1Below ? scenario1.name : scenario2.name} is cheaper. Above that, ${preferScenario1Below ? scenario2.name : scenario1.name} is preferred.`,
  };
}

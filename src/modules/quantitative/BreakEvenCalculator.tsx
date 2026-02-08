import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Info, AlertTriangle, CheckCircle } from "lucide-react";
import {
  FormInput,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import { breakEvenSchema, type BreakEvenInput } from "@/schemas";
import {
  calculateBreakEven,
  generateBreakEvenChartData,
  calculateProfitAtQuantity,
  calculateMarginOfSafety,
  formatCurrency,
  type BreakEvenResult,
  type BreakEvenChartPoint,
} from "@/utils/calculations/break-even";

export function BreakEvenCalculator() {
  const [result, setResult] = useState<BreakEvenResult | null>(null);
  const [chartData, setChartData] = useState<BreakEvenChartPoint[]>([]);

  const form = useForm<BreakEvenInput>({
    resolver: zodResolver(breakEvenSchema) as any,
    defaultValues: {
      fixedCosts: 50000,
      variableCostPerUnit: 25,
      sellingPricePerUnit: 50,
      targetProfit: 20000,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const calcResult = calculateBreakEven(data);
    setResult(calcResult);

    const chartPoints = generateBreakEvenChartData(data);
    setChartData(chartPoints);
  });

  const currentQty = form.watch("currentQuantity") || 0;
  const currentProfit = result ? calculateProfitAtQuantity(form.getValues(), currentQty) : 0;
  const marginOfSafety =
    result && result.isViable ? calculateMarginOfSafety(currentQty, result.breakEvenQuantity) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Break-even analysis determines the point where total revenue equals total costs.
            At this point, there is no profit or loss. Understanding your break-even point
            helps with pricing decisions, cost control, and sales targets.
          </p>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost & Revenue Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Fixed Costs"
              type="number"
              unit="$"
              hint="Rent, salaries, insurance, equipment costs"
              error={form.formState.errors.fixedCosts?.message}
              {...form.register("fixedCosts", { valueAsNumber: true })}
            />

            <FormInput
              label="Variable Cost per Unit"
              type="number"
              unit="$"
              step="0.01"
              hint="Materials, direct labor per unit"
              error={form.formState.errors.variableCostPerUnit?.message}
              {...form.register("variableCostPerUnit", { valueAsNumber: true })}
            />

            <FormInput
              label="Selling Price per Unit"
              type="number"
              unit="$"
              step="0.01"
              hint="Revenue received per unit sold"
              error={form.formState.errors.sellingPricePerUnit?.message}
              {...form.register("sellingPricePerUnit", { valueAsNumber: true })}
            />

            <FormInput
              label="Target Profit"
              type="number"
              unit="$"
              hint="Optional: desired profit amount"
              error={form.formState.errors.targetProfit?.message}
              {...form.register("targetProfit", { valueAsNumber: true })}
            />
          </div>

          <Separator />

          <FormInput
            label="Current/Projected Sales"
            type="number"
            unit="units"
            hint="Enter current or projected sales to calculate margin of safety"
            error={form.formState.errors.currentQuantity?.message}
            {...form.register("currentQuantity", { valueAsNumber: true })}
            className="max-w-xs"
          />

          <CalculateButton type="submit">Calculate Break-Even</CalculateButton>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Viability Check */}
            {!result.isViable ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <div className="font-medium text-destructive">Not Viable</div>
                    <p className="text-sm mt-1">{result.analysis}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <div className="text-sm text-muted-foreground">Break-Even Quantity</div>
                    <div className="text-3xl font-bold text-primary">
                      {Math.ceil(result.breakEvenQuantity).toLocaleString()} units
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <div className="text-sm text-muted-foreground">Break-Even Revenue</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(result.breakEvenRevenue)}
                    </div>
                  </div>
                </div>

                {/* Contribution Margin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <div className="text-sm text-muted-foreground">Contribution Margin</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(result.contributionMargin)}/unit
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Selling Price - Variable Cost
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <div className="text-sm text-muted-foreground">Contribution Margin Ratio</div>
                    <div className={`text-2xl font-bold ${
                      result.contributionMarginRatio >= 50 ? "text-green-600" :
                      result.contributionMarginRatio >= 25 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {result.contributionMarginRatio.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CM / Selling Price
                    </div>
                  </div>
                </div>

                {/* Target Profit */}
                {result.targetProfitQuantity && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-medium mb-2">
                      Target Profit: {formatCurrency(form.watch("targetProfit") || 0)}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Required Quantity</div>
                        <div className="text-xl font-bold">
                          {Math.ceil(result.targetProfitQuantity).toLocaleString()} units
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Required Revenue</div>
                        <div className="text-xl font-bold">
                          {formatCurrency(result.targetProfitRevenue || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Current Performance */}
                <div>
                  <h4 className="font-medium mb-3">Current/Projected Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <div className="text-xs text-muted-foreground">Sales Quantity</div>
                      <div className="text-lg font-bold">{currentQty.toLocaleString()}</div>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      currentProfit >= 0
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}>
                      <div className="text-xs text-muted-foreground">
                        {currentProfit >= 0 ? "Profit" : "Loss"}
                      </div>
                      <div className={`text-lg font-bold ${
                        currentProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {formatCurrency(Math.abs(currentProfit))}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      marginOfSafety > 0
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}>
                      <div className="text-xs text-muted-foreground">Margin of Safety</div>
                      <div className={`text-lg font-bold ${
                        marginOfSafety > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {marginOfSafety.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {currentProfit >= 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">{result.analysis}</p>
                </div>

                {/* Simple Chart Visualization */}
                <div>
                  <h4 className="font-medium mb-3">Cost-Volume-Profit Chart</h4>
                  <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <div className="min-w-[400px]">
                      <div className="flex items-end justify-between h-40 gap-1">
                        {chartData.slice(0, 15).map((point, i) => {
                          const maxValue = Math.max(
                            ...chartData.map(p => Math.max(p.revenue, p.totalCost))
                          );
                          const revenueHeight = (point.revenue / maxValue) * 100;
                          const costHeight = (point.totalCost / maxValue) * 100;
                          const isBreakEven = Math.abs(point.quantity - result.breakEvenQuantity) <
                            (chartData[1]?.quantity - chartData[0]?.quantity || 100);

                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="relative w-full h-32 flex items-end gap-0.5">
                                <div
                                  className="w-1/2 bg-green-500 rounded-t"
                                  style={{ height: `${revenueHeight}%` }}
                                  title={`Revenue: ${formatCurrency(point.revenue)}`}
                                />
                                <div
                                  className={`w-1/2 rounded-t ${isBreakEven ? 'bg-primary' : 'bg-red-400'}`}
                                  style={{ height: `${costHeight}%` }}
                                  title={`Cost: ${formatCurrency(point.totalCost)}`}
                                />
                              </div>
                              {i % 3 === 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {point.quantity}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded" />
                          <span>Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-400 rounded" />
                          <span>Total Cost</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-primary rounded" />
                          <span>Break-Even</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulas */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Formulas</h4>
                  <div className="text-sm font-mono space-y-1">
                    <p>
                      Contribution Margin = Selling Price - Variable Cost = $
                      {form.watch("sellingPricePerUnit")} - ${form.watch("variableCostPerUnit")} = $
                      {result.contributionMargin.toFixed(2)}
                    </p>
                    <p>
                      Break-Even Quantity = Fixed Costs / CM = $
                      {form.watch("fixedCosts").toLocaleString()} / $
                      {result.contributionMargin.toFixed(2)} = {result.breakEvenQuantity.toFixed(1)}{" "}
                      units
                    </p>
                    <p>
                      Break-Even Revenue = BEQ × Price = {result.breakEvenQuantity.toFixed(1)} × $
                      {form.watch("sellingPricePerUnit")} = {formatCurrency(result.breakEvenRevenue)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Break-Even Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Contribution Margin:</strong> Amount each unit contributes to covering
              fixed costs and generating profit.
            </div>
            <div>
              <strong>CM Ratio:</strong> Percentage of each sales dollar that contributes to
              fixed costs/profit. Higher is better (&gt;50% excellent, 25-50% good).
            </div>
            <div>
              <strong>Margin of Safety:</strong> How far sales can drop before reaching break-even.
              Higher percentages indicate lower risk.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Panel */}
      <HelpPanel title="Break-Even Analysis">
        <HelpPanel.Formula>
          <div className="space-y-2">
            <p>
              <strong>Break-Even Quantity (BEQ)</strong> = Fixed Costs / Contribution Margin
            </p>
            <p>
              <strong>Contribution Margin (CM)</strong> = Selling Price - Variable Cost per Unit
            </p>
            <p>
              <strong>CM Ratio</strong> = (CM / Selling Price) × 100
            </p>
            <p>
              <strong>Target Profit Quantity</strong> = (Fixed Costs + Target Profit) / CM
            </p>
          </div>
        </HelpPanel.Formula>

        <HelpPanel.Reference>
          Horngren, C. T., Datar, S. M., & Rajan, M. V. (2015).{" "}
          <em>Cost Accounting: A Managerial Emphasis</em> (15th ed.). Pearson.
        </HelpPanel.Reference>
      </HelpPanel>
    </form>
  );
}

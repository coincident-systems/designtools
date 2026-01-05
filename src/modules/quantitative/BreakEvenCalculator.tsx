import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, TrendingUp, Info, AlertTriangle, CheckCircle } from "lucide-react";
import {
  calculateBreakEven,
  generateBreakEvenChartData,
  calculateProfitAtQuantity,
  calculateMarginOfSafety,
  formatCurrency,
  type BreakEvenInputs,
  type BreakEvenResult,
  type BreakEvenChartPoint,
} from "@/utils/calculations/break-even";

export function BreakEvenCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>({
    fixedCosts: 50000,
    variableCostPerUnit: 25,
    sellingPricePerUnit: 50,
    targetProfit: 20000,
  });
  const [currentQuantity, setCurrentQuantity] = useState("2000");
  const [result, setResult] = useState<BreakEvenResult | null>(null);
  const [chartData, setChartData] = useState<BreakEvenChartPoint[]>([]);

  const handleCalculate = () => {
    const calcResult = calculateBreakEven(inputs);
    setResult(calcResult);

    const data = generateBreakEvenChartData(inputs);
    setChartData(data);
  };

  const updateInput = (field: keyof BreakEvenInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const currentQty = parseFloat(currentQuantity) || 0;
  const currentProfit = result ? calculateProfitAtQuantity(inputs, currentQty) : 0;
  const marginOfSafety = result && result.isViable
    ? calculateMarginOfSafety(currentQty, result.breakEvenQuantity)
    : 0;

  return (
    <div className="space-y-6">
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
            <div className="space-y-2">
              <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
              <Input
                id="fixedCosts"
                type="number"
                min="0"
                value={inputs.fixedCosts}
                onChange={(e) => updateInput("fixedCosts", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Rent, salaries, insurance, equipment costs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableCost">Variable Cost per Unit ($)</Label>
              <Input
                id="variableCost"
                type="number"
                min="0"
                step="0.01"
                value={inputs.variableCostPerUnit}
                onChange={(e) => updateInput("variableCostPerUnit", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Materials, direct labor, packaging per unit
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price per Unit ($)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={inputs.sellingPricePerUnit}
                onChange={(e) => updateInput("sellingPricePerUnit", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Revenue received per unit sold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetProfit">Target Profit ($)</Label>
              <Input
                id="targetProfit"
                type="number"
                min="0"
                value={inputs.targetProfit || ""}
                onChange={(e) => updateInput("targetProfit", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: desired profit amount
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="currentQuantity">Current/Projected Sales (units)</Label>
            <Input
              id="currentQuantity"
              type="number"
              min="0"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Enter current or projected sales to calculate margin of safety
            </p>
          </div>

          <Button onClick={handleCalculate} className="w-full md:w-auto">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Break-Even
          </Button>
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
                    <h4 className="font-medium mb-2">Target Profit: {formatCurrency(inputs.targetProfit || 0)}</h4>
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
                    <p>Contribution Margin = Selling Price - Variable Cost = ${inputs.sellingPricePerUnit} - ${inputs.variableCostPerUnit} = ${result.contributionMargin.toFixed(2)}</p>
                    <p>Break-Even Quantity = Fixed Costs / CM = ${inputs.fixedCosts.toLocaleString()} / ${result.contributionMargin.toFixed(2)} = {result.breakEvenQuantity.toFixed(1)} units</p>
                    <p>Break-Even Revenue = BEQ × Price = {result.breakEvenQuantity.toFixed(1)} × ${inputs.sellingPricePerUnit} = {formatCurrency(result.breakEvenRevenue)}</p>
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
    </div>
  );
}

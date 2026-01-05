import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, TrendingDown } from "lucide-react";
import {
  calculateTwoPointMethod,
  calculateRegressionMethod,
  predictTimeAtCycle,
  formatExponent,
  LEARNING_RATE_PRESETS,
  type LearningCurveResult,
  type RegressionResult,
} from "@/utils/calculations/learning-curves";

type CalculationMode = "two-point" | "regression";

interface DataPoint {
  cycle: string;
  time: string;
}

export function LearningCurvesCalculator() {
  const [mode, setMode] = useState<CalculationMode>("two-point");

  // Two-Point Method state
  const [twoPointInputs, setTwoPointInputs] = useState({
    x1: "50",
    y1: "20",
    x2: "100",
    y2: "15",
    predictCycle: "200",
  });
  const [twoPointResult, setTwoPointResult] = useState<LearningCurveResult | null>(null);
  const [twoPointError, setTwoPointError] = useState<string | null>(null);
  const [twoPointPrediction, setTwoPointPrediction] = useState<number | null>(null);

  // Regression Method state
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { cycle: "1", time: "100" },
    { cycle: "2", time: "80" },
    { cycle: "4", time: "64" },
    { cycle: "8", time: "51" },
  ]);
  const [regressionPredictCycle, setRegressionPredictCycle] = useState("16");
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
  const [regressionError, setRegressionError] = useState<string | null>(null);
  const [regressionPrediction, setRegressionPrediction] = useState<number | null>(null);

  const handleCalculateTwoPoint = () => {
    setTwoPointError(null);
    setTwoPointPrediction(null);
    try {
      const x1 = parseFloat(twoPointInputs.x1);
      const y1 = parseFloat(twoPointInputs.y1);
      const x2 = parseFloat(twoPointInputs.x2);
      const y2 = parseFloat(twoPointInputs.y2);
      const predictCycle = parseFloat(twoPointInputs.predictCycle);

      if ([x1, y1, x2, y2].some(isNaN)) {
        setTwoPointError("Please enter valid numbers for all data points");
        setTwoPointResult(null);
        return;
      }

      const result = calculateTwoPointMethod({ x1, y1, x2, y2 });
      setTwoPointResult(result);

      // Calculate prediction if valid
      if (!isNaN(predictCycle) && predictCycle > 0) {
        const predicted = predictTimeAtCycle(predictCycle, result.firstUnitValue, result.exponent);
        setTwoPointPrediction(predicted);
      }
    } catch (err) {
      setTwoPointError(err instanceof Error ? err.message : "Calculation error");
      setTwoPointResult(null);
    }
  };

  const handleCalculateRegression = () => {
    setRegressionError(null);
    setRegressionPrediction(null);
    try {
      const cycles = dataPoints.map((p) => parseFloat(p.cycle));
      const times = dataPoints.map((p) => parseFloat(p.time));
      const predictCycle = parseFloat(regressionPredictCycle);

      if (cycles.some(isNaN) || times.some(isNaN)) {
        setRegressionError("Please enter valid numbers for all data points");
        setRegressionResult(null);
        return;
      }

      const result = calculateRegressionMethod({ cycles, times });
      setRegressionResult(result);

      // Calculate prediction if valid
      if (!isNaN(predictCycle) && predictCycle > 0) {
        const predicted = predictTimeAtCycle(predictCycle, result.firstUnitValue, result.exponent);
        setRegressionPrediction(predicted);
      }
    } catch (err) {
      setRegressionError(err instanceof Error ? err.message : "Calculation error");
      setRegressionResult(null);
    }
  };

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { cycle: "", time: "" }]);
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 2) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: string) => {
    const updated = [...dataPoints];
    updated[index] = { ...updated[index], [field]: value };
    setDataPoints(updated);
  };

  const closestPreset = useMemo(() => {
    if (!twoPointResult) return null;
    const rate = twoPointResult.learningRatePercent;
    return LEARNING_RATE_PRESETS.reduce((prev, curr) =>
      Math.abs(curr.value - rate) < Math.abs(prev.value - rate) ? curr : prev
    );
  }, [twoPointResult]);

  return (
    <div className="space-y-6">
      {/* Definition Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" aria-hidden="true" />
            Learning Curves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The more a worker performs a task, the quicker the worker becomes. Learning curves
            model this improvement using the equation{" "}
            <span className="font-mono">Y = aX<sup>b</sup></span>, where Y is time per unit, X is
            the unit number, a is the first unit time, and b is the learning exponent.
          </p>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div className="flex gap-4">
        <Button
          variant={mode === "two-point" ? "default" : "outline"}
          onClick={() => setMode("two-point")}
          className="flex-1"
        >
          Two-Point Method
        </Button>
        <Button
          variant={mode === "regression" ? "default" : "outline"}
          onClick={() => setMode("regression")}
          className="flex-1"
        >
          Regression Method
        </Button>
      </div>

      {/* Two-Point Method */}
      {mode === "two-point" && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-primary">Two-Point Method</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate the learning curve equation from two data points. Enter cycle numbers and
              their corresponding times.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Point */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">First Data Point</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="tp-x1">Cycle Number</Label>
                  <Input
                    id="tp-x1"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="50"
                    value={twoPointInputs.x1}
                    onChange={(e) =>
                      setTwoPointInputs((prev) => ({ ...prev, x1: e.target.value }))
                    }
                    aria-describedby="tp-x1-hint"
                  />
                  <p id="tp-x1-hint" className="text-xs text-muted-foreground">
                    Unit/cycle number for first observation
                  </p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="tp-y1">Time (minutes)</Label>
                  <Input
                    id="tp-y1"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="20"
                    value={twoPointInputs.y1}
                    onChange={(e) =>
                      setTwoPointInputs((prev) => ({ ...prev, y1: e.target.value }))
                    }
                    aria-describedby="tp-y1-hint"
                  />
                  <p id="tp-y1-hint" className="text-xs text-muted-foreground">
                    Time per unit at this cycle
                  </p>
                </div>
              </div>
            </div>

            {/* Second Point */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Second Data Point</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="tp-x2">Cycle Number</Label>
                  <Input
                    id="tp-x2"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100"
                    value={twoPointInputs.x2}
                    onChange={(e) =>
                      setTwoPointInputs((prev) => ({ ...prev, x2: e.target.value }))
                    }
                    aria-describedby="tp-x2-hint"
                  />
                  <p id="tp-x2-hint" className="text-xs text-muted-foreground">
                    Must be greater than first cycle
                  </p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="tp-y2">Time (minutes)</Label>
                  <Input
                    id="tp-y2"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="15"
                    value={twoPointInputs.y2}
                    onChange={(e) =>
                      setTwoPointInputs((prev) => ({ ...prev, y2: e.target.value }))
                    }
                    aria-describedby="tp-y2-hint"
                  />
                  <p id="tp-y2-hint" className="text-xs text-muted-foreground">
                    Should be less than first time
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Prediction Input */}
            <div className="grid gap-1.5">
              <Label htmlFor="tp-predict">Predict Time at Cycle</Label>
              <Input
                id="tp-predict"
                type="number"
                min="1"
                step="1"
                placeholder="200"
                value={twoPointInputs.predictCycle}
                onChange={(e) =>
                  setTwoPointInputs((prev) => ({ ...prev, predictCycle: e.target.value }))
                }
                aria-describedby="tp-predict-hint"
              />
              <p id="tp-predict-hint" className="text-xs text-muted-foreground">
                Optional: Calculate predicted time for a specific cycle
              </p>
            </div>

            <Button
              onClick={handleCalculateTwoPoint}
              className="w-full"
              data-testid="calculate-two-point"
            >
              <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
              Calculate Learning Curve
            </Button>

            {twoPointError && (
              <div
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                role="alert"
              >
                {twoPointError}
              </div>
            )}

            {twoPointResult && !twoPointError && (
              <div
                className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4"
                role="status"
                aria-live="polite"
                data-testid="two-point-result"
              >
                <div className="text-sm text-muted-foreground mb-1">Learning Curve Results</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Learning Rate</div>
                    <div className="text-2xl font-bold text-primary">
                      {twoPointResult.learningRatePercent.toFixed(1)}%
                    </div>
                    {closestPreset && (
                      <div className="text-xs text-muted-foreground">{closestPreset.label}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Learning Exponent (b)</div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      {formatExponent(twoPointResult.exponent)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">First Unit Time (a)</div>
                  <div className="text-xl font-semibold">
                    {twoPointResult.firstUnitValue.toFixed(2)} minutes
                  </div>
                </div>

                <div className="p-3 rounded bg-background/50">
                  <div className="text-sm text-muted-foreground">Learning Curve Equation</div>
                  <div className="font-mono text-lg">
                    Y = {twoPointResult.firstUnitValue.toFixed(2)} × X
                    <sup>{formatExponent(twoPointResult.exponent)}</sup>
                  </div>
                </div>

                {twoPointPrediction !== null && (
                  <div className="p-3 rounded bg-secondary/20 border border-secondary/30">
                    <div className="text-sm text-muted-foreground">
                      Predicted Time at Cycle {twoPointInputs.predictCycle}
                    </div>
                    <div className="text-xl font-bold text-secondary">
                      {twoPointPrediction.toFixed(2)} minutes
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regression Method */}
      {mode === "regression" && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-primary">Regression Method</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estimate a learning curve equation from a series of data using the least squares
              method. Add multiple data points for better accuracy.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Data Points</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDataPoint}
                  data-testid="add-data-point"
                >
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  Add Point
                </Button>
              </div>

              <div className="space-y-2" role="list" aria-label="Data points for regression">
                {dataPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                    role="listitem"
                    aria-label={`Data point ${index + 1}`}
                  >
                    <span className="text-sm text-muted-foreground w-8">
                      {index + 1}.
                    </span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Cycle"
                        value={point.cycle}
                        onChange={(e) => updateDataPoint(index, "cycle", e.target.value)}
                        aria-label={`Cycle number for point ${index + 1}`}
                      />
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Time"
                        value={point.time}
                        onChange={(e) => updateDataPoint(index, "time", e.target.value)}
                        aria-label={`Time for point ${index + 1}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDataPoint(index)}
                      disabled={dataPoints.length <= 2}
                      aria-label={`Remove data point ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter cycle numbers and their corresponding times. Minimum 2 points required.
              </p>
            </div>

            <Separator />

            {/* Prediction Input */}
            <div className="grid gap-1.5">
              <Label htmlFor="reg-predict">Predict Time at Cycle</Label>
              <Input
                id="reg-predict"
                type="number"
                min="1"
                step="1"
                placeholder="16"
                value={regressionPredictCycle}
                onChange={(e) => setRegressionPredictCycle(e.target.value)}
                aria-describedby="reg-predict-hint"
              />
              <p id="reg-predict-hint" className="text-xs text-muted-foreground">
                Optional: Calculate predicted time for a specific cycle
              </p>
            </div>

            <Button
              onClick={handleCalculateRegression}
              className="w-full"
              data-testid="calculate-regression"
            >
              <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
              Calculate Learning Curve
            </Button>

            {regressionError && (
              <div
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                role="alert"
              >
                {regressionError}
              </div>
            )}

            {regressionResult && !regressionError && (
              <div
                className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4"
                role="status"
                aria-live="polite"
                data-testid="regression-result"
              >
                <div className="text-sm text-muted-foreground mb-1">Regression Results</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Learning Rate</div>
                    <div className="text-2xl font-bold text-primary">
                      {regressionResult.learningRatePercent.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Learning Exponent (b)</div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      {formatExponent(regressionResult.exponent)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">First Unit Time (a)</div>
                    <div className="text-xl font-semibold">
                      {regressionResult.firstUnitValue.toFixed(2)} min
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">R² (Fit Quality)</div>
                    <div className="text-xl font-semibold">
                      {(regressionResult.rSquared * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded bg-background/50">
                  <div className="text-sm text-muted-foreground">Learning Curve Equation</div>
                  <div className="font-mono text-lg">
                    Y = {regressionResult.firstUnitValue.toFixed(2)} × X
                    <sup>{formatExponent(regressionResult.exponent)}</sup>
                  </div>
                </div>

                {regressionPrediction !== null && (
                  <div className="p-3 rounded bg-secondary/20 border border-secondary/30">
                    <div className="text-sm text-muted-foreground">
                      Predicted Time at Cycle {regressionPredictCycle}
                    </div>
                    <div className="text-xl font-bold text-secondary">
                      {regressionPrediction.toFixed(2)} minutes
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Common Learning Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Learning Rate</th>
                  <th className="text-left py-2 font-medium">Exponent (b)</th>
                  <th className="text-left py-2 font-medium">Typical Application</th>
                </tr>
              </thead>
              <tbody>
                {LEARNING_RATE_PRESETS.map((preset) => {
                  const exp = Math.log(preset.value / 100) / Math.log(2);
                  return (
                    <tr key={preset.value} className="border-b last:border-0">
                      <td className="py-2 font-semibold">{preset.value}%</td>
                      <td className="py-2 font-mono">{exp.toFixed(4)}</td>
                      <td className="py-2 text-muted-foreground">{preset.label.split("(")[1]?.replace(")", "") || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

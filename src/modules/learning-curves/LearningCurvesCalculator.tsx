import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, TrendingDown } from "lucide-react";
import {
  FormInput,
  FormFrame,
  ResultsDisplay,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import {
  learningCurveTwoPointSchema,
  learningCurveRegressionSchema,
  type LearningCurveTwoPointInput,
  type LearningCurveRegressionInput,
} from "@/schemas";
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

export function LearningCurvesCalculator() {
  const [mode, setMode] = useState<CalculationMode>("two-point");
  const [twoPointResult, setTwoPointResult] = useState<LearningCurveResult | null>(null);
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);

  // Two-Point Method form
  const twoPointForm = useForm<LearningCurveTwoPointInput>({
    resolver: zodResolver(learningCurveTwoPointSchema),
    defaultValues: {
      x1: 50,
      y1: 20,
      x2: 100,
      y2: 15,
      predictionCycle: 200,
    },
  });

  // Regression Method form
  const regressionForm = useForm<LearningCurveRegressionInput>({
    resolver: zodResolver(learningCurveRegressionSchema),
    defaultValues: {
      dataPoints: [
        { cycle: 1, time: 100 },
        { cycle: 2, time: 80 },
        { cycle: 4, time: 64 },
        { cycle: 8, time: 51 },
      ],
      predictionCycle: 16,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: regressionForm.control,
    name: "dataPoints",
  });

  const handleTwoPointSubmit = twoPointForm.handleSubmit((data) => {
    const result = calculateTwoPointMethod(data);
    setTwoPointResult(result);
  });

  const handleRegressionSubmit = regressionForm.handleSubmit((data) => {
    const cycles = data.dataPoints.map((p) => p.cycle);
    const times = data.dataPoints.map((p) => p.time);
    const result = calculateRegressionMethod({ cycles, times });
    setRegressionResult(result);
  });

  const closestPreset = useMemo(() => {
    if (!twoPointResult) return null;
    const rate = twoPointResult.learningRatePercent;
    return LEARNING_RATE_PRESETS.reduce((prev, curr) =>
      Math.abs(curr.value - rate) < Math.abs(prev.value - rate) ? curr : prev
    );
  }, [twoPointResult]);

  const twoPointPrediction = useMemo(() => {
    if (!twoPointResult) return null;
    const cycle = twoPointForm.watch("predictionCycle");
    if (!cycle || cycle < 1) return null;
    return predictTimeAtCycle(cycle, twoPointResult.firstUnitValue, twoPointResult.exponent);
  }, [twoPointResult, twoPointForm.watch("predictionCycle")]);

  const regressionPrediction = useMemo(() => {
    if (!regressionResult) return null;
    const cycle = regressionForm.watch("predictionCycle");
    if (!cycle || cycle < 1) return null;
    return predictTimeAtCycle(cycle, regressionResult.firstUnitValue, regressionResult.exponent);
  }, [regressionResult, regressionForm.watch("predictionCycle")]);

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
            <span className="font-mono">
              Y = aX<sup>b</sup>
            </span>
            , where Y is time per unit, X is the unit number, a is the first unit time, and b is
            the learning exponent.
          </p>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div className="flex gap-4">
        <Button
          variant={mode === "two-point" ? "default" : "outline"}
          onClick={() => {
            setMode("two-point");
            setTwoPointResult(null);
          }}
          className="flex-1"
        >
          Two-Point Method
        </Button>
        <Button
          variant={mode === "regression" ? "default" : "outline"}
          onClick={() => {
            setMode("regression");
            setRegressionResult(null);
          }}
          className="flex-1"
        >
          Regression Method
        </Button>
      </div>

      {/* Two-Point Method */}
      {mode === "two-point" && (
        <form onSubmit={handleTwoPointSubmit}>
          <FormFrame
            title="Two-Point Method"
            description="Calculate the learning curve equation from two data points. Enter cycle numbers and their corresponding times."
          >
            <div className="space-y-6">
              {/* First Point */}
              <div className="space-y-3">
                <p className="text-base font-semibold">First Data Point</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Cycle Number"
                    type="number"
                    hint="Unit/cycle number for first observation"
                    error={twoPointForm.formState.errors.x1?.message}
                    {...twoPointForm.register("x1", { valueAsNumber: true })}
                  />
                  <FormInput
                    label="Time"
                    type="number"
                    unit="minutes"
                    step="0.01"
                    hint="Time per unit at this cycle"
                    error={twoPointForm.formState.errors.y1?.message}
                    {...twoPointForm.register("y1", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Second Point */}
              <div className="space-y-3">
                <p className="text-base font-semibold">Second Data Point</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Cycle Number"
                    type="number"
                    hint="Must be greater than first cycle"
                    error={twoPointForm.formState.errors.x2?.message}
                    {...twoPointForm.register("x2", { valueAsNumber: true })}
                  />
                  <FormInput
                    label="Time"
                    type="number"
                    unit="minutes"
                    step="0.01"
                    hint="Should be less than first time"
                    error={twoPointForm.formState.errors.y2?.message}
                    {...twoPointForm.register("y2", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <FormInput
                  label="Predict Time at Cycle"
                  type="number"
                  hint="Optional: Calculate predicted time for a specific cycle"
                  error={twoPointForm.formState.errors.predictionCycle?.message}
                  {...twoPointForm.register("predictionCycle", { valueAsNumber: true })}
                />
              </div>

              <CalculateButton type="submit" data-testid="calculate-two-point">
                Calculate Learning Curve
              </CalculateButton>

              {twoPointResult && (
                <ResultsDisplay
                  status="success"
                  items={[
                    {
                      label: "Learning Rate",
                      value: `${twoPointResult.learningRatePercent.toFixed(1)}%`,
                      description: closestPreset?.label,
                    },
                    {
                      label: "Learning Exponent (b)",
                      value: formatExponent(twoPointResult.exponent),
                      monospace: true,
                    },
                    {
                      label: "First Unit Time (a)",
                      value: `${twoPointResult.firstUnitValue.toFixed(2)} minutes`,
                    },
                    {
                      label: "Learning Curve Equation",
                      value: `Y = ${twoPointResult.firstUnitValue.toFixed(2)} × X^${formatExponent(twoPointResult.exponent)}`,
                      monospace: true,
                    },
                    ...(twoPointPrediction !== null
                      ? [
                          {
                            label: `Predicted Time at Cycle ${twoPointForm.watch("predictionCycle")}`,
                            value: `${twoPointPrediction.toFixed(2)} minutes`,
                          },
                        ]
                      : []),
                  ]}
                  data-testid="two-point-result"
                />
              )}
            </div>
          </FormFrame>
        </form>
      )}

      {/* Regression Method */}
      {mode === "regression" && (
        <form onSubmit={handleRegressionSubmit}>
          <FormFrame
            title="Regression Method"
            description="Estimate a learning curve equation from a series of data using the least squares method. Add multiple data points for better accuracy."
          >
            <div className="space-y-6">
              {/* Data Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">Data Points</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ cycle: 0, time: 0 })}
                    data-testid="add-data-point"
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Add Point
                  </Button>
                </div>

                <div className="space-y-2" role="list" aria-label="Data points for regression">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2"
                      role="listitem"
                      aria-label={`Data point ${index + 1}`}
                    >
                      <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <FormInput
                          label=""
                          type="number"
                          placeholder="Cycle"
                          error={
                            regressionForm.formState.errors.dataPoints?.[index]?.cycle?.message
                          }
                          {...regressionForm.register(`dataPoints.${index}.cycle`, {
                            valueAsNumber: true,
                          })}
                          aria-label={`Cycle number for point ${index + 1}`}
                        />
                        <FormInput
                          label=""
                          type="number"
                          placeholder="Time"
                          step="0.01"
                          error={regressionForm.formState.errors.dataPoints?.[index]?.time?.message}
                          {...regressionForm.register(`dataPoints.${index}.time`, {
                            valueAsNumber: true,
                          })}
                          aria-label={`Time for point ${index + 1}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
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

              <div className="border-t pt-4">
                <FormInput
                  label="Predict Time at Cycle"
                  type="number"
                  hint="Optional: Calculate predicted time for a specific cycle"
                  error={regressionForm.formState.errors.predictionCycle?.message}
                  {...regressionForm.register("predictionCycle", { valueAsNumber: true })}
                />
              </div>

              <CalculateButton type="submit" data-testid="calculate-regression">
                Calculate Learning Curve
              </CalculateButton>

              {regressionResult && (
                <ResultsDisplay
                  status="success"
                  items={[
                    {
                      label: "Learning Rate",
                      value: `${regressionResult.learningRatePercent.toFixed(1)}%`,
                    },
                    {
                      label: "Learning Exponent (b)",
                      value: formatExponent(regressionResult.exponent),
                      monospace: true,
                    },
                    {
                      label: "First Unit Time (a)",
                      value: `${regressionResult.firstUnitValue.toFixed(2)} minutes`,
                    },
                    {
                      label: "R² (Fit Quality)",
                      value: `${(regressionResult.rSquared * 100).toFixed(1)}%`,
                    },
                    {
                      label: "Learning Curve Equation",
                      value: `Y = ${regressionResult.firstUnitValue.toFixed(2)} × X^${formatExponent(regressionResult.exponent)}`,
                      monospace: true,
                    },
                    ...(regressionPrediction !== null
                      ? [
                          {
                            label: `Predicted Time at Cycle ${regressionForm.watch("predictionCycle")}`,
                            value: `${regressionPrediction.toFixed(2)} minutes`,
                          },
                        ]
                      : []),
                  ]}
                  data-testid="regression-result"
                />
              )}
            </div>
          </FormFrame>
        </form>
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
                      <td className="py-2 text-muted-foreground">
                        {preset.label.split("(")[1]?.replace(")", "") || ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Help Panel */}
      <HelpPanel title="Learning Curves">
        <HelpPanel.Formula>
          <p className="mb-2">
            Learning curve equation: <span className="font-mono">Y = aX^b</span>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Y</strong> = Time per unit (or cost per unit)
            </li>
            <li>
              <strong>X</strong> = Unit/cycle number
            </li>
            <li>
              <strong>a</strong> = Time for the first unit
            </li>
            <li>
              <strong>b</strong> = Learning exponent = log(learning rate) / log(2)
            </li>
          </ul>
          <p className="mt-3">
            <strong>Learning Rate:</strong> The percentage of time required when production doubles.
            For example, an 80% learning rate means the 2nd unit takes 80% of the time of the 1st
            unit, the 4th takes 80% of the 2nd, etc.
          </p>
        </HelpPanel.Formula>

        <HelpPanel.Reference>
          Niebel, B. W., & Freivalds, A. (2009). <em>Methods, Standards, and Work Design</em> (11th
          ed.). McGraw-Hill. Chapter 17: Learning Curves.
        </HelpPanel.Reference>
      </HelpPanel>
    </div>
  );
}

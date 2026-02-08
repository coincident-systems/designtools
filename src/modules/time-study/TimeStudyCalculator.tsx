import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock, Info } from "lucide-react";
import {
  FormInput,
  FormSelect,
  FormFrame,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import { Separator } from "@/components/ui/separator";
import { timeStudySchema, type TimeStudyInput } from "@/schemas";
import {
  calculateTimeStudy,
  calculateWestinghouseRating,
  calculateRequiredSampleSize,
  formatTime,
  calculatePiecesPerHour,
  SKILL_RATINGS,
  EFFORT_RATINGS,
  CONDITIONS_RATINGS,
  CONSISTENCY_RATINGS,
  type TimeStudyResult,
} from "@/utils/calculations/time-study";

export function TimeStudyCalculator() {
  const [result, setResult] = useState<TimeStudyResult | null>(null);
  const [requiredSamples, setRequiredSamples] = useState<number | null>(null);
  const [observationCount, setObservationCount] = useState(5);

  const form = useForm<TimeStudyInput>({
    resolver: zodResolver(timeStudySchema) as any,
    defaultValues: {
      observations: [0, 0, 0, 0, 0],
      rating: {
        skill: "D",
        effort: "D",
        conditions: "D",
        consistency: "D",
      },
      allowancePercent: 15,
    },
  });

  // Update form observations when count changes
  useEffect(() => {
    const current = form.getValues("observations");
    if (current.length < observationCount) {
      // Add new observations
      form.setValue("observations", [...current, ...Array(observationCount - current.length).fill(0)]);
    } else if (current.length > observationCount) {
      // Remove observations
      form.setValue("observations", current.slice(0, observationCount));
    }
  }, [observationCount, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const validObs = data.observations.filter((n) => n > 0);
    if (validObs.length < 2) return;

    const calcResult = calculateTimeStudy(validObs, data.rating as any, data.allowancePercent!);
    setResult(calcResult);

    const required = calculateRequiredSampleSize(validObs, 0.05, 0.95);
    setRequiredSamples(required);
  });

  const currentRating = form.watch("rating");
  const currentRatingFactor = useMemo(
    () => calculateWestinghouseRating(currentRating),
    [currentRating]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Time Study Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Time study uses direct observation to measure work time. The Westinghouse rating system
            adjusts observed times based on the worker's skill, effort, conditions, and consistency
            to calculate a standard time applicable to a qualified operator working at normal pace.
          </p>
        </CardContent>
      </Card>

      {/* Observations Input */}
      <FormFrame
        title="Observations (seconds)"
        description="Enter observed cycle times in seconds. Minimum 2 observations required."
      >
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setObservationCount(Math.max(2, observationCount - 1))}
              disabled={observationCount <= 2}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setObservationCount(Math.min(30, observationCount + 1))}
              disabled={observationCount >= 30}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: observationCount }).map((_, index) => (
              <FormInput
                key={index}
                label=""
                type="number"
                step="0.1"
                placeholder={`#${index + 1}`}
                error={form.formState.errors.observations?.[index]?.message}
                {...form.register(`observations.${index}`, { valueAsNumber: true })}
              />
            ))}
          </div>
        </div>
      </FormFrame>

      {/* Westinghouse Rating */}
      <FormFrame
        title="Westinghouse Performance Rating"
        description="Rate the observed worker's performance compared to a normal qualified operator."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Skill"
              value={currentRating.skill}
              onValueChange={(v) => form.setValue("rating.skill", v as any)}
              options={Object.entries(SKILL_RATINGS).map(([key, { label, value }]) => ({
                value: key,
                label: `${key} - ${label} (${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%)`,
              }))}
              error={form.formState.errors.rating?.skill?.message}
            />

            <FormSelect
              label="Effort"
              value={currentRating.effort}
              onValueChange={(v) => form.setValue("rating.effort", v as any)}
              options={Object.entries(EFFORT_RATINGS).map(([key, { label, value }]) => ({
                value: key,
                label: `${key} - ${label} (${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%)`,
              }))}
              error={form.formState.errors.rating?.effort?.message}
            />

            <FormSelect
              label="Conditions"
              value={currentRating.conditions}
              onValueChange={(v) => form.setValue("rating.conditions", v as any)}
              options={Object.entries(CONDITIONS_RATINGS).map(([key, { label, value }]) => ({
                value: key,
                label: `${key} - ${label} (${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%)`,
              }))}
              error={form.formState.errors.rating?.conditions?.message}
            />

            <FormSelect
              label="Consistency"
              value={currentRating.consistency}
              onValueChange={(v) => form.setValue("rating.consistency", v as any)}
              options={Object.entries(CONSISTENCY_RATINGS).map(([key, { label, value }]) => ({
                value: key,
                label: `${key} - ${label} (${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%)`,
              }))}
              error={form.formState.errors.rating?.consistency?.message}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-sm text-muted-foreground">Combined Rating Factor</div>
            <div className="text-2xl font-bold">{(currentRatingFactor * 100).toFixed(0)}%</div>
          </div>
        </div>
      </FormFrame>

      {/* Allowances */}
      <FormFrame title="Allowances">
        <FormInput
          label="Personal, Fatigue & Delay (PFD) Allowance"
          type="number"
          unit="%"
          hint="Typical values: 10-15% for light work, 15-20% for heavy work"
          error={form.formState.errors.allowancePercent?.message}
          {...form.register("allowancePercent", { valueAsNumber: true })}
          className="max-w-xs"
        />

        <CalculateButton type="submit">Calculate Standard Time</CalculateButton>
      </FormFrame>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Observed Time</div>
                <div className="text-2xl font-bold">{formatTime(result.observedTime)}</div>
                <div className="text-xs text-muted-foreground">Mean of observations</div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Normal Time</div>
                <div className="text-2xl font-bold">{formatTime(result.normalTime)}</div>
                <div className="text-xs text-muted-foreground">OT × Rating Factor</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground">Standard Time</div>
                <div className="text-2xl font-bold text-primary">{formatTime(result.standardTime)}</div>
                <div className="text-xs text-muted-foreground">NT × (1 + Allowance)</div>
              </div>
            </div>

            {/* Production Rate */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Standard Production Rate</div>
                  <div className="text-xl font-semibold">
                    {calculatePiecesPerHour(result.standardTime).toFixed(1)} pieces/hour
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Pieces per 8-hour shift</div>
                  <div className="text-xl font-semibold">
                    {(calculatePiecesPerHour(result.standardTime) * 8).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Statistics */}
            <div>
              <h4 className="font-medium mb-3">Observation Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Count</div>
                  <div className="text-lg font-mono">{result.statistics.count}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Std Dev</div>
                  <div className="text-lg font-mono">{result.statistics.standardDeviation.toFixed(2)}s</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xs text-muted-foreground">CV</div>
                  <div className="text-lg font-mono">{result.statistics.coefficientOfVariation.toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xs text-muted-foreground">Range</div>
                  <div className="text-lg font-mono">{result.statistics.range.toFixed(2)}s</div>
                </div>
              </div>
            </div>

            {/* Sample Size */}
            {requiredSamples !== null && (
              <div className={`p-4 rounded-lg border ${
                result.statistics.count >= requiredSamples
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              }`}>
                <h4 className="font-medium mb-1">Sample Size Analysis</h4>
                <p className="text-sm">
                  For ±5% accuracy at 95% confidence: <strong>{requiredSamples}</strong> observations required.
                  {result.statistics.count >= requiredSamples ? (
                    <span className="text-green-600 dark:text-green-400"> Your sample size is adequate.</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400"> Consider collecting {requiredSamples - result.statistics.count} more observations.</span>
                  )}
                </p>
              </div>
            )}

            {/* Calculation Breakdown */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Calculation</h4>
              <div className="text-sm font-mono space-y-1">
                <p>Observed Time (OT) = {result.observedTime.toFixed(3)} sec</p>
                <p>Rating Factor = {(result.ratingFactor * 100).toFixed(0)}%</p>
                <p>Normal Time (NT) = OT × Rating = {result.observedTime.toFixed(3)} × {result.ratingFactor.toFixed(2)} = {result.normalTime.toFixed(3)} sec</p>
                <p>Allowance Factor = 1 + {form.watch("allowancePercent")}% = {result.allowanceFactor.toFixed(2)}</p>
                <p>Standard Time (ST) = NT × Allowance = {result.normalTime.toFixed(3)} × {result.allowanceFactor.toFixed(2)} = {result.standardTime.toFixed(3)} sec</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Westinghouse Rating Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Factor</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Skill</td>
                  <td className="py-2">
                    Proficiency following a method; dexterity and coordination
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Effort</td>
                  <td className="py-2">
                    Demonstration of will to work effectively; speed and energy
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Conditions</td>
                  <td className="py-2">Environmental factors: light, temperature, noise, etc.</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">Consistency</td>
                  <td className="py-2">Variation in cycle times across observations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Help Panel */}
      <HelpPanel title="Time Study">
        <HelpPanel.Formula>
          <div className="space-y-2">
            <p>
              <strong>Standard Time (ST)</strong> = Normal Time × (1 + Allowance%)
            </p>
            <p>
              <strong>Normal Time (NT)</strong> = Observed Time × Rating Factor
            </p>
            <p>
              <strong>Rating Factor</strong> = 1 + Σ(Westinghouse adjustments for skill, effort,
              conditions, consistency)
            </p>
          </div>
        </HelpPanel.Formula>

        <HelpPanel.Reference>
          Niebel, B. W., & Freivalds, A. (2009). <em>Methods, Standards, and Work Design</em> (11th
          ed.). McGraw-Hill. Chapter 11: Performance Rating and Chapter 13: Allowances.
        </HelpPanel.Reference>
      </HelpPanel>
    </form>
  );
}

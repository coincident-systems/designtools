import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, Clock, Info } from "lucide-react";
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
  type SkillRating,
  type EffortRating,
  type ConditionsRating,
  type ConsistencyRating,
  type WestinghouseRating,
  type TimeStudyResult,
} from "@/utils/calculations/time-study";

export function TimeStudyCalculator() {
  const [observations, setObservations] = useState<string[]>(["", "", "", "", ""]);
  const [rating, setRating] = useState<WestinghouseRating>({
    skill: "D",
    effort: "D",
    conditions: "D",
    consistency: "D",
  });
  const [allowance, setAllowance] = useState("15");
  const [result, setResult] = useState<TimeStudyResult | null>(null);
  const [requiredSamples, setRequiredSamples] = useState<number | null>(null);

  const handleCalculate = () => {
    const validObs = observations
      .map((o) => parseFloat(o))
      .filter((n) => !isNaN(n) && n > 0);

    if (validObs.length < 2) {
      return;
    }

    const allowancePercent = parseFloat(allowance) || 15;
    const calcResult = calculateTimeStudy(validObs, rating, allowancePercent);
    setResult(calcResult);

    // Calculate required sample size for ±5% accuracy at 95% confidence
    const required = calculateRequiredSampleSize(validObs, 0.05, 0.95);
    setRequiredSamples(required);
  };

  const addObservation = () => {
    if (observations.length < 30) {
      setObservations([...observations, ""]);
    }
  };

  const removeObservation = (index: number) => {
    if (observations.length > 2) {
      setObservations(observations.filter((_, i) => i !== index));
    }
  };

  const updateObservation = (index: number, value: string) => {
    const updated = [...observations];
    updated[index] = value;
    setObservations(updated);
  };

  const currentRatingFactor = calculateWestinghouseRating(rating);

  return (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary">Observations (seconds)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addObservation}
              disabled={observations.length >= 30}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter observed cycle times in seconds. Minimum 2 observations required.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {observations.map((obs, index) => (
              <div key={index} className="relative">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={`#${index + 1}`}
                  value={obs}
                  onChange={(e) => updateObservation(index, e.target.value)}
                  className="pr-8"
                />
                {observations.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-8 opacity-50 hover:opacity-100"
                    onClick={() => removeObservation(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Westinghouse Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary">Westinghouse Performance Rating</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rate the observed worker's performance compared to a normal qualified operator.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skill */}
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select
                value={rating.skill}
                onValueChange={(v) => setRating({ ...rating, skill: v as SkillRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SKILL_RATINGS).map(([key, { label, value }]) => (
                    <SelectItem key={key} value={key}>
                      {key} - {label} ({value >= 0 ? "+" : ""}{(value * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effort */}
            <div className="space-y-2">
              <Label>Effort</Label>
              <Select
                value={rating.effort}
                onValueChange={(v) => setRating({ ...rating, effort: v as EffortRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EFFORT_RATINGS).map(([key, { label, value }]) => (
                    <SelectItem key={key} value={key}>
                      {key} - {label} ({value >= 0 ? "+" : ""}{(value * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <Label>Conditions</Label>
              <Select
                value={rating.conditions}
                onValueChange={(v) => setRating({ ...rating, conditions: v as ConditionsRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITIONS_RATINGS).map(([key, { label, value }]) => (
                    <SelectItem key={key} value={key}>
                      {key} - {label} ({value >= 0 ? "+" : ""}{(value * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Consistency */}
            <div className="space-y-2">
              <Label>Consistency</Label>
              <Select
                value={rating.consistency}
                onValueChange={(v) => setRating({ ...rating, consistency: v as ConsistencyRating })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONSISTENCY_RATINGS).map(([key, { label, value }]) => (
                    <SelectItem key={key} value={key}>
                      {key} - {label} ({value >= 0 ? "+" : ""}{(value * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-sm text-muted-foreground">Combined Rating Factor</div>
            <div className="text-2xl font-bold">
              {(currentRatingFactor * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Allowances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allowance">Personal, Fatigue & Delay (PFD) Allowance (%)</Label>
            <Input
              id="allowance"
              type="number"
              min="0"
              max="50"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Typical values: 10-15% for light work, 15-20% for heavy work
            </p>
          </div>

          <Button onClick={handleCalculate} className="w-full md:w-auto">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Standard Time
          </Button>
        </CardContent>
      </Card>

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
                <p>Allowance Factor = 1 + {allowance}% = {result.allowanceFactor.toFixed(2)}</p>
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
                  <td className="py-2">Proficiency following a method; dexterity and coordination</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Effort</td>
                  <td className="py-2">Demonstration of will to work effectively; speed and energy</td>
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
    </div>
  );
}

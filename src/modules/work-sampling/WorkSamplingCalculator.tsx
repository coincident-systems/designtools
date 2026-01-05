import { useState, useMemo } from "react";
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
import { Calculator, Shuffle } from "lucide-react";
import {
  CONFIDENCE_LEVELS,
  getZValue,
  calculateSampleSize,
  calculateErrorLimit,
  generateRandomObservationTimes,
  formatErrorAsPercentage,
} from "@/utils/calculations/work-sampling";

export function WorkSamplingCalculator() {
  // Sample Size Calculator state
  const [sampleSizeInputs, setSampleSizeInputs] = useState({
    p: "0.5",
    confidence: "0.95",
    errorLimit: "0.05",
  });
  const [sampleSizeResult, setSampleSizeResult] = useState<number | null>(null);
  const [sampleSizeError, setSampleSizeError] = useState<string | null>(null);

  // Error Limit Calculator state
  const [errorLimitInputs, setErrorLimitInputs] = useState({
    p: "0.5",
    confidence: "0.95",
    sampleSize: "384",
  });
  const [errorLimitResult, setErrorLimitResult] = useState<number | null>(null);
  const [errorLimitError, setErrorLimitError] = useState<string | null>(null);

  // Random Times Generator state
  const [observationCount, setObservationCount] = useState("10");
  const [randomTimes, setRandomTimes] = useState<string[]>([]);
  const [randomTimesError, setRandomTimesError] = useState<string | null>(null);

  // Derived z-values for display
  const sampleSizeZ = useMemo(
    () => getZValue(sampleSizeInputs.confidence),
    [sampleSizeInputs.confidence]
  );
  const errorLimitZ = useMemo(
    () => getZValue(errorLimitInputs.confidence),
    [errorLimitInputs.confidence]
  );

  const handleCalculateSampleSize = () => {
    setSampleSizeError(null);
    try {
      const p = parseFloat(sampleSizeInputs.p);
      const l = parseFloat(sampleSizeInputs.errorLimit);

      if (isNaN(p)) {
        setSampleSizeError("Please enter a valid probability");
        setSampleSizeResult(null);
        return;
      }
      if (isNaN(l)) {
        setSampleSizeError("Please enter a valid error limit");
        setSampleSizeResult(null);
        return;
      }

      const result = calculateSampleSize(p, sampleSizeZ, l);
      setSampleSizeResult(result);
    } catch (err) {
      setSampleSizeError(err instanceof Error ? err.message : "Calculation error");
      setSampleSizeResult(null);
    }
  };

  const handleCalculateErrorLimit = () => {
    setErrorLimitError(null);
    try {
      const p = parseFloat(errorLimitInputs.p);
      const n = parseInt(errorLimitInputs.sampleSize, 10);

      if (isNaN(p)) {
        setErrorLimitError("Please enter a valid probability");
        setErrorLimitResult(null);
        return;
      }
      if (isNaN(n)) {
        setErrorLimitError("Please enter a valid sample size");
        setErrorLimitResult(null);
        return;
      }

      const result = calculateErrorLimit(p, errorLimitZ, n);
      setErrorLimitResult(result);
    } catch (err) {
      setErrorLimitError(err instanceof Error ? err.message : "Calculation error");
      setErrorLimitResult(null);
    }
  };

  const handleGenerateRandomTimes = () => {
    setRandomTimesError(null);
    try {
      const count = parseInt(observationCount, 10);

      if (isNaN(count)) {
        setRandomTimesError("Please enter a valid number");
        setRandomTimes([]);
        return;
      }

      const times = generateRandomObservationTimes(count);
      setRandomTimes(times);
    } catch (err) {
      setRandomTimesError(err instanceof Error ? err.message : "Generation error");
      setRandomTimes([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculate Sample Size (n) */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-primary">Calculate Sample Size</span>
              <span className="text-muted-foreground font-normal text-base italic">
                (n)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ss-p">
                Probability of occurrence{" "}
                <span className="italic text-muted-foreground">(p)</span>
              </Label>
              <Input
                id="ss-p"
                type="number"
                min="0"
                max="1"
                step="0.01"
                placeholder="0.50"
                value={sampleSizeInputs.p}
                onChange={(e) =>
                  setSampleSizeInputs((prev) => ({ ...prev, p: e.target.value }))
                }
                aria-describedby="ss-p-hint"
              />
              <p id="ss-p-hint" className="text-xs text-muted-foreground">
                Enter a value between 0 and 1 (e.g., 0.5 for 50%)
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ss-confidence">
                Confidence Level{" "}
                <span className="italic text-muted-foreground">(1 - α)</span>
              </Label>
              <Select
                value={sampleSizeInputs.confidence}
                onValueChange={(v) =>
                  setSampleSizeInputs((prev) => ({ ...prev, confidence: v }))
                }
              >
                <SelectTrigger id="ss-confidence" aria-label="Select confidence level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONFIDENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-muted-foreground" id="ss-z-label">
                z-Value corresponding to (1 - α)
              </Label>
              <div
                className="h-10 px-3 py-2 rounded-md border bg-muted text-right font-mono"
                aria-labelledby="ss-z-label"
                role="status"
              >
                {sampleSizeZ.toFixed(3)}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ss-error">
                Maximum Limit of Error{" "}
                <span className="italic text-muted-foreground">(l)</span>
              </Label>
              <Input
                id="ss-error"
                type="number"
                min="0.001"
                max="1"
                step="0.01"
                placeholder="0.05"
                value={sampleSizeInputs.errorLimit}
                onChange={(e) =>
                  setSampleSizeInputs((prev) => ({
                    ...prev,
                    errorLimit: e.target.value,
                  }))
                }
                aria-describedby="ss-error-hint"
              />
              <p id="ss-error-hint" className="text-xs text-muted-foreground">
                Enter as decimal (e.g., 0.05 for ±5%)
              </p>
            </div>

            <Separator />

            <Button
              onClick={handleCalculateSampleSize}
              className="w-full"
              data-testid="calculate-sample-size"
            >
              <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
              Calculate
            </Button>

            {sampleSizeError && (
              <div
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                role="alert"
              >
                {sampleSizeError}
              </div>
            )}

            {sampleSizeResult !== null && !sampleSizeError && (
              <div
                className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                role="status"
                aria-live="polite"
                data-testid="sample-size-result"
              >
                <div className="text-sm text-muted-foreground mb-1">
                  Required Sample Size
                </div>
                <div className="text-2xl font-bold text-primary">
                  n = {sampleSizeResult.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculate Error Limit (l) */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-primary">Calculate Error Limit</span>
              <span className="text-muted-foreground font-normal text-base italic">
                (l)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="el-p">
                Probability of occurrence{" "}
                <span className="italic text-muted-foreground">(p)</span>
              </Label>
              <Input
                id="el-p"
                type="number"
                min="0"
                max="1"
                step="0.01"
                placeholder="0.50"
                value={errorLimitInputs.p}
                onChange={(e) =>
                  setErrorLimitInputs((prev) => ({ ...prev, p: e.target.value }))
                }
                aria-describedby="el-p-hint"
              />
              <p id="el-p-hint" className="text-xs text-muted-foreground">
                Enter a value between 0 and 1 (e.g., 0.5 for 50%)
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="el-confidence">
                Confidence Level{" "}
                <span className="italic text-muted-foreground">(1 - α)</span>
              </Label>
              <Select
                value={errorLimitInputs.confidence}
                onValueChange={(v) =>
                  setErrorLimitInputs((prev) => ({ ...prev, confidence: v }))
                }
              >
                <SelectTrigger id="el-confidence" aria-label="Select confidence level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONFIDENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-muted-foreground" id="el-z-label">
                z-Value corresponding to (1 - α)
              </Label>
              <div
                className="h-10 px-3 py-2 rounded-md border bg-muted text-right font-mono"
                aria-labelledby="el-z-label"
                role="status"
              >
                {errorLimitZ.toFixed(3)}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="el-n">
                Sample Size{" "}
                <span className="italic text-muted-foreground">(n)</span>
              </Label>
              <Input
                id="el-n"
                type="number"
                min="1"
                step="1"
                placeholder="384"
                value={errorLimitInputs.sampleSize}
                onChange={(e) =>
                  setErrorLimitInputs((prev) => ({
                    ...prev,
                    sampleSize: e.target.value,
                  }))
                }
                aria-describedby="el-n-hint"
              />
              <p id="el-n-hint" className="text-xs text-muted-foreground">
                Number of observations in the study
              </p>
            </div>

            <Separator />

            <Button
              onClick={handleCalculateErrorLimit}
              className="w-full"
              data-testid="calculate-error-limit"
            >
              <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
              Calculate
            </Button>

            {errorLimitError && (
              <div
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                role="alert"
              >
                {errorLimitError}
              </div>
            )}

            {errorLimitResult !== null && !errorLimitError && (
              <div
                className="p-4 rounded-lg bg-secondary/10 border border-secondary/20"
                role="status"
                aria-live="polite"
                data-testid="error-limit-result"
              >
                <div className="text-sm text-muted-foreground mb-1">
                  Maximum Error Limit
                </div>
                <div className="text-2xl font-bold text-secondary">
                  l = {formatErrorAsPercentage(errorLimitResult)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  ({errorLimitResult.toFixed(4)})
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate Random Sampling Times */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-primary">
            Generate Random Observation Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-1.5 flex-1">
              <Label htmlFor="obs-count">Number of Observations</Label>
              <Input
                id="obs-count"
                type="number"
                min="1"
                max="1000"
                placeholder="10"
                value={observationCount}
                onChange={(e) => setObservationCount(e.target.value)}
                aria-describedby="obs-count-hint"
              />
              <p id="obs-count-hint" className="text-xs text-muted-foreground">
                Maximum 1000 observations
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateRandomTimes}
                variant="secondary"
                data-testid="generate-times"
              >
                <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
                Generate
              </Button>
            </div>
          </div>

          {randomTimesError && (
            <div
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              role="alert"
            >
              {randomTimesError}
            </div>
          )}

          {randomTimes.length > 0 && !randomTimesError && (
            <div className="mt-4" data-testid="random-times-result">
              <div className="text-sm text-muted-foreground mb-2">
                Random observation times (8:00 AM - 5:00 PM):
              </div>
              <div
                className="p-4 rounded-lg bg-muted font-mono text-sm grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
                role="list"
                aria-label="Generated observation times"
              >
                {randomTimes.map((time, i) => (
                  <div key={i} className="text-center" role="listitem">
                    <span className="text-muted-foreground mr-1">{i + 1}.</span>
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

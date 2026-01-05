import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, Volume2, AlertTriangle, CheckCircle } from "lucide-react";
import {
  calculateNoiseDose,
  formatDose,
  formatDuration,
  getRiskLevel,
  OSHA_PERMISSIBLE_EXPOSURES,
  type NoiseExposure,
  type NoiseDoseResult,
} from "@/utils/calculations/noise-dose";

interface ExposureInput {
  level: string;
  duration: string;
}

const MAX_EXPOSURES = 8;

export function NoiseDoseCalculator() {
  const [exposures, setExposures] = useState<ExposureInput[]>([
    { level: "90", duration: "4" },
    { level: "95", duration: "2" },
  ]);
  const [result, setResult] = useState<NoiseDoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    try {
      // Parse and validate inputs
      const validExposures: NoiseExposure[] = exposures
        .map((exp) => ({
          level: parseFloat(exp.level),
          duration: parseFloat(exp.duration),
        }))
        .filter((exp) => !isNaN(exp.level) && !isNaN(exp.duration) && exp.duration > 0);

      if (validExposures.length === 0) {
        setError("Please enter at least one valid exposure (noise level and duration > 0)");
        setResult(null);
        return;
      }

      const calculationResult = calculateNoiseDose(validExposures);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
      setResult(null);
    }
  };

  const addExposure = () => {
    if (exposures.length < MAX_EXPOSURES) {
      setExposures([...exposures, { level: "", duration: "" }]);
    }
  };

  const removeExposure = (index: number) => {
    if (exposures.length > 1) {
      setExposures(exposures.filter((_, i) => i !== index));
    }
  };

  const updateExposure = (index: number, field: keyof ExposureInput, value: string) => {
    const updated = [...exposures];
    updated[index] = { ...updated[index], [field]: value };
    setExposures(updated);
  };

  const riskInfo = result ? getRiskLevel(result.dose) : null;

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" aria-hidden="true" />
            OSHA Noise Dose Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Calculate occupational noise exposure based on OSHA 29 CFR 1910.95. The permissible
            exposure limit (PEL) is 90 dB(A) for 8 hours. For every 5 dB increase, the allowed
            time is halved. A noise dose of 100% equals the maximum allowable daily exposure.
          </p>
        </CardContent>
      </Card>

      {/* Exposure Input */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary">Noise Exposure Data</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addExposure}
              disabled={exposures.length >= MAX_EXPOSURES}
              data-testid="add-exposure"
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Exposure
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter up to {MAX_EXPOSURES} different noise exposures throughout the workday.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Noise Level (dB)</div>
            <div className="col-span-5">Duration (hours)</div>
            <div className="col-span-1"></div>
          </div>

          {/* Exposure Rows */}
          <div
            className="space-y-2"
            role="list"
            aria-label="Noise exposure entries"
          >
            {exposures.map((exposure, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center"
                role="listitem"
                aria-label={`Exposure ${index + 1}`}
              >
                <div className="col-span-1 text-sm text-muted-foreground font-medium">
                  {index + 1}.
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    min="80"
                    max="130"
                    step="1"
                    placeholder="90"
                    value={exposure.level}
                    onChange={(e) => updateExposure(index, "level", e.target.value)}
                    aria-label={`Noise level for exposure ${index + 1}`}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.25"
                    placeholder="4"
                    value={exposure.duration}
                    onChange={(e) => updateExposure(index, "duration", e.target.value)}
                    aria-label={`Duration for exposure ${index + 1}`}
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExposure(index)}
                    disabled={exposures.length <= 1}
                    aria-label={`Remove exposure ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <Button
            onClick={handleCalculate}
            className="w-full"
            data-testid="calculate-noise-dose"
          >
            <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
            Calculate OSHA Noise Dose
          </Button>

          {error && (
            <div
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {result && !error && (
            <div
              className="space-y-4"
              role="status"
              aria-live="polite"
              data-testid="noise-dose-result"
            >
              {/* Main Result */}
              <div
                className={`p-4 rounded-lg border ${
                  riskInfo?.level === "exceeded"
                    ? "bg-destructive/10 border-destructive/20"
                    : riskInfo?.level === "action"
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : "bg-green-500/10 border-green-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {riskInfo?.level === "exceeded" ? (
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                  ) : riskInfo?.level === "action" ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Total Noise Dose</div>
                    <div
                      className={`text-3xl font-bold ${
                        riskInfo?.level === "exceeded"
                          ? "text-destructive"
                          : riskInfo?.level === "action"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {formatDose(result.dose)}
                    </div>
                    <div className="text-sm mt-1">{riskInfo?.description}</div>
                  </div>
                </div>
              </div>

              {/* TWA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Time-Weighted Average (TWA)</div>
                  <div className="text-2xl font-bold">{result.twa.toFixed(1)} dB(A)</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-lg font-semibold">
                    {result.exceedsPEL
                      ? "Exceeds PEL"
                      : result.exceedsActionLevel
                        ? "Action Level"
                        : "Acceptable"}
                  </div>
                </div>
              </div>

              {/* Exposure Breakdown */}
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm font-medium mb-2">Exposure Breakdown</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" role="table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Level</th>
                        <th className="text-left py-2">Actual</th>
                        <th className="text-left py-2">Allowed</th>
                        <th className="text-right py-2">Dose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.exposures
                        .filter((exp) => exp.partialDose > 0)
                        .map((exp, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 font-mono">{exp.level} dB</td>
                            <td className="py-2">{formatDuration(exp.actualDuration)}</td>
                            <td className="py-2">{formatDuration(exp.allowedDuration)}</td>
                            <td className="py-2 text-right font-medium">
                              {exp.partialDose.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">OSHA Permissible Noise Exposures</CardTitle>
          <p className="text-sm text-muted-foreground">
            Reference table from 29 CFR 1910.95 Table G-16
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Sound Level (dB)</th>
                  <th className="text-left py-2 font-medium">Allowed Duration</th>
                </tr>
              </thead>
              <tbody>
                {OSHA_PERMISSIBLE_EXPOSURES.map(({ level, duration }) => (
                  <tr key={level} className="border-b last:border-0">
                    <td className="py-2 font-mono">{level} dB(A)</td>
                    <td className="py-2">{formatDuration(duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Exposure to impulsive or impact noise should not exceed 140 dB peak sound pressure level.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

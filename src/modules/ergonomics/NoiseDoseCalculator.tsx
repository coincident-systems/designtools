import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Volume2, AlertTriangle, CheckCircle } from "lucide-react";
import {
  FormInput,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import { noiseDoseSchema, type NoiseDoseInput } from "@/schemas";
import {
  calculateNoiseDose,
  formatDose,
  formatDuration,
  getRiskLevel,
  OSHA_PERMISSIBLE_EXPOSURES,
  type NoiseDoseResult,
} from "@/utils/calculations/noise-dose";

export function NoiseDoseCalculator() {
  const [result, setResult] = useState<NoiseDoseResult | null>(null);

  const form = useForm<NoiseDoseInput>({
    resolver: zodResolver(noiseDoseSchema) as any,
    defaultValues: {
      exposures: [
        { level: 90, duration: 4 },
        { level: 95, duration: 2 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exposures",
  });

  const handleSubmit = form.handleSubmit((data) => {
    const calcResult = calculateNoiseDose(data.exposures);
    setResult(calcResult);
  });

  const riskInfo = result ? getRiskLevel(result.dose) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ level: 90, duration: 4 })}
              disabled={fields.length >= 8}
              data-testid="add-exposure"
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Exposure
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter up to 8 different noise exposures throughout the workday.
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
          <div className="space-y-2" role="list" aria-label="Noise exposure entries">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 items-center"
                role="listitem"
                aria-label={`Exposure ${index + 1}`}
              >
                <div className="col-span-1 text-sm text-muted-foreground font-medium">
                  {index + 1}.
                </div>
                <div className="col-span-5">
                  <FormInput
                    label=""
                    type="number"
                    placeholder="90"
                    error={form.formState.errors.exposures?.[index]?.level?.message}
                    {...form.register(`exposures.${index}.level`, { valueAsNumber: true })}
                    aria-label={`Noise level for exposure ${index + 1}`}
                  />
                </div>
                <div className="col-span-5">
                  <FormInput
                    label=""
                    type="number"
                    step="0.25"
                    placeholder="4"
                    error={form.formState.errors.exposures?.[index]?.duration?.message}
                    {...form.register(`exposures.${index}.duration`, { valueAsNumber: true })}
                    aria-label={`Duration for exposure ${index + 1}`}
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label={`Remove exposure ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <CalculateButton type="submit" data-testid="calculate-noise-dose">
            Calculate OSHA Noise Dose
          </CalculateButton>

          {result && (
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

      {/* Help Panel */}
      <HelpPanel title="OSHA Noise Dose">
        <HelpPanel.Formula>
          <p className="mb-2">
            <strong>Noise Dose</strong> = Σ(C_i / T_i) × 100
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>C_i = Actual exposure time at noise level i (hours)</li>
            <li>T_i = Allowable exposure time at noise level i (hours)</li>
          </ul>
          <p className="mt-3">
            <strong>Time-Weighted Average (TWA)</strong> = 16.61 × log₁₀(Dose/100) + 90 dB(A)
          </p>
          <p className="mt-2 text-sm">
            OSHA uses a 5 dB exchange rate, meaning the allowed exposure time is halved for every 5
            dB increase in noise level.
          </p>
        </HelpPanel.Formula>

        <HelpPanel.Reference>
          OSHA. (1983). Occupational Noise Exposure; Hearing Conservation Amendment; Final Rule. 29
          CFR 1910.95. <em>Federal Register</em>, 48(46), 9738-9785.
        </HelpPanel.Reference>
      </HelpPanel>
    </form>
  );
}

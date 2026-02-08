import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import {
  FormInput,
  FormSelect,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import { nioshLiftingSchema, type NioshLiftingInput } from "@/schemas";
import {
  calculateNIOSH,
  formatWeight,
  type NIOSHResult,
} from "@/utils/calculations/niosh-lifting";

export function NIOSHCalculator() {
  const [result, setResult] = useState<NIOSHResult | null>(null);

  const form = useForm<NioshLiftingInput>({
    resolver: zodResolver(nioshLiftingSchema) as any,
    defaultValues: {
      horizontalDistance: 40,
      verticalDistance: 75,
      travelDistance: 25,
      asymmetricAngle: 0,
      frequency: 1,
      duration: "moderate",
      coupling: "good",
      loadWeight: 15,
      unit: "metric",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const calcResult = calculateNIOSH(data as any);
    setResult(calcResult);
  });

  const currentUnit = form.watch("unit");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            NIOSH Lifting Equation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The NIOSH (National Institute for Occupational Safety and Health) Revised Lifting
            Equation calculates the Recommended Weight Limit (RWL) for manual lifting tasks.
            A Lifting Index (LI) greater than 1.0 indicates increased risk of low back injury.
          </p>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary">Lifting Task Parameters</CardTitle>
            <FormSelect
              label=""
              value={currentUnit}
              onValueChange={(v) => form.setValue("unit", v as any)}
              options={[
                { value: "metric", label: "Metric" },
                { value: "imperial", label: "Imperial" },
              ]}
              className="w-32"
            />
          </div>
        </CardHeader>
        <CardContent>
        <div className="space-y-6">
          {/* Distance inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={`Horizontal Distance`}
              type="number"
              unit={currentUnit === "metric" ? "cm" : "in"}
              hint="Distance from midpoint between ankles to hands"
              error={form.formState.errors.horizontalDistance?.message}
              {...form.register("horizontalDistance", { valueAsNumber: true })}
            />

            <FormInput
              label="Vertical Location"
              type="number"
              unit={currentUnit === "metric" ? "cm" : "in"}
              hint="Height of hands from floor at lift origin"
              error={form.formState.errors.verticalDistance?.message}
              {...form.register("verticalDistance", { valueAsNumber: true })}
            />

            <FormInput
              label="Travel Distance"
              type="number"
              unit={currentUnit === "metric" ? "cm" : "in"}
              hint="Vertical distance the load is moved"
              error={form.formState.errors.travelDistance?.message}
              {...form.register("travelDistance", { valueAsNumber: true })}
            />

            <FormInput
              label="Asymmetric Angle"
              type="number"
              unit="°"
              hint="Angular displacement from sagittal plane (0-135°)"
              error={form.formState.errors.asymmetricAngle?.message}
              {...form.register("asymmetricAngle", { valueAsNumber: true })}
            />
          </div>

          <Separator />

          {/* Frequency and duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Frequency"
              type="number"
              unit="lifts/min"
              step="0.1"
              error={form.formState.errors.frequency?.message}
              {...form.register("frequency", { valueAsNumber: true })}
            />

            <FormSelect
              label="Duration"
              value={form.watch("duration")}
              onValueChange={(v) => form.setValue("duration", v as any)}
              options={[
                { value: "short", label: "Short (< 1 hr)" },
                { value: "moderate", label: "Moderate (1-2 hrs)" },
                { value: "long", label: "Long (2-8 hrs)" },
              ]}
              error={form.formState.errors.duration?.message}
            />

            <FormSelect
              label="Coupling Quality"
              value={form.watch("coupling")}
              onValueChange={(v) => form.setValue("coupling", v as any)}
              options={[
                { value: "good", label: "Good (handles, cut-outs)" },
                { value: "fair", label: "Fair (adequate grip)" },
                { value: "poor", label: "Poor (bulky, slippery)" },
              ]}
              error={form.formState.errors.coupling?.message}
            />
          </div>

          <Separator />

          {/* Load weight */}
          <FormInput
            label="Actual Load Weight"
            type="number"
            unit={currentUnit === "metric" ? "kg" : "lb"}
            error={form.formState.errors.loadWeight?.message}
            {...form.register("loadWeight", { valueAsNumber: true })}
            className="max-w-xs"
          />

          <CalculateButton type="submit">Calculate RWL & Lifting Index</CalculateButton>
        </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main result */}
            <div
              className={`p-4 rounded-lg border ${
                result.riskLevel === "acceptable"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : result.riskLevel === "increased"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.riskLevel === "acceptable" ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle
                    className={`h-6 w-6 flex-shrink-0 ${
                      result.riskLevel === "increased"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <div>
                      <div className="text-sm text-muted-foreground">Lifting Index</div>
                      <div
                        className={`text-3xl font-bold ${
                          result.riskLevel === "acceptable"
                            ? "text-green-600 dark:text-green-400"
                            : result.riskLevel === "increased"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {result.liftingIndex.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Recommended Weight Limit</div>
                      <div className="text-2xl font-semibold">
                        {formatWeight(result.rwl, currentUnit)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{result.riskDescription}</p>
                </div>
              </div>
            </div>

            {/* Multipliers breakdown */}
            <div>
              <h4 className="font-medium mb-3">Multiplier Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(result.multipliers).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hm: "Horizontal",
                    vm: "Vertical",
                    dm: "Distance",
                    am: "Asymmetric",
                    fm: "Frequency",
                    cm: "Coupling",
                  };
                  const isLimiting = result.limitingFactor
                    .toLowerCase()
                    .includes(labels[key].toLowerCase());
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg text-center ${
                        isLimiting
                          ? "bg-yellow-100 dark:bg-yellow-900/30 ring-1 ring-yellow-400"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {labels[key]}
                      </div>
                      <div className="text-lg font-mono font-semibold">{value.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Limiting factor:</strong> {result.limitingFactor}
              </p>
            </div>

            {/* Formula explanation */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Calculation</h4>
              <p className="text-sm font-mono">RWL = LC × HM × VM × DM × AM × FM × CM</p>
              <p className="text-sm font-mono mt-1">
                RWL = {currentUnit === "metric" ? "23" : "51"} ×{" "}
                {result.multipliers.hm.toFixed(2)} × {result.multipliers.vm.toFixed(2)} ×{" "}
                {result.multipliers.dm.toFixed(2)} × {result.multipliers.am.toFixed(2)} ×{" "}
                {result.multipliers.fm.toFixed(2)} × {result.multipliers.cm.toFixed(2)}
              </p>
              <p className="text-sm font-mono mt-1">
                RWL = {result.rwl.toFixed(1)} {currentUnit === "metric" ? "kg" : "lb"}
              </p>
              <p className="text-sm font-mono mt-2">
                LI = Load / RWL = {form.watch("loadWeight")} / {result.rwl.toFixed(1)} ={" "}
                {result.liftingIndex.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Risk Level Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>
                <strong>LI ≤ 1.0:</strong> Acceptable - minimal risk for most workers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>
                <strong>1.0 &lt; LI ≤ 3.0:</strong> Increased risk - consider task redesign
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>
                <strong>LI &gt; 3.0:</strong> High risk - task redesign required
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Panel */}
      <HelpPanel title="NIOSH Lifting Equation">
        <HelpPanel.Formula>
          <p className="mb-2">
            <strong>Recommended Weight Limit (RWL)</strong> = LC × HM × VM × DM × AM × FM × CM
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>LC = Load Constant (23 kg or 51 lb)</li>
            <li>HM = Horizontal Multiplier</li>
            <li>VM = Vertical Multiplier</li>
            <li>DM = Distance Multiplier</li>
            <li>AM = Asymmetric Multiplier</li>
            <li>FM = Frequency Multiplier</li>
            <li>CM = Coupling Multiplier</li>
          </ul>
          <p className="mt-3">
            <strong>Lifting Index (LI)</strong> = Load Weight / RWL
          </p>
        </HelpPanel.Formula>

        <HelpPanel.Reference>
          Waters, T. R., Putz-Anderson, V., Garg, A., & Fine, L. J. (1993). Revised NIOSH equation
          for the design and evaluation of manual lifting tasks. <em>Ergonomics</em>, 36(7),
          749-776.
        </HelpPanel.Reference>
      </HelpPanel>
    </form>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormInput,
  FormSelect,
  FormFrame,
  ResultsDisplay,
  CalculateButton,
  HelpPanel,
} from "@/components/forms";
import {
  workSamplingSampleSizeSchema,
  workSamplingErrorLimitSchema,
  workSamplingRandomTimesSchema,
  type WorkSamplingSampleSizeInput,
  type WorkSamplingErrorLimitInput,
  type WorkSamplingRandomTimesInput,
} from "@/schemas";
import {
  CONFIDENCE_LEVELS,
  getZValue,
  calculateSampleSize,
  calculateErrorLimit,
  generateRandomObservationTimes,
  formatErrorAsPercentage,
} from "@/utils/calculations/work-sampling";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkSamplingCalculator() {
  // Sample Size Calculator
  const sampleSizeForm = useForm<WorkSamplingSampleSizeInput>({
    resolver: zodResolver(workSamplingSampleSizeSchema),
    defaultValues: {
      proportion: 0.5,
      confidence: "0.95",
      errorLimit: 0.05,
    },
  });

  const [sampleSizeResult, setSampleSizeResult] = useState<number | null>(null);

  const handleCalculateSampleSize = sampleSizeForm.handleSubmit((data) => {
    const z = getZValue(data.confidence);
    const result = calculateSampleSize(data.proportion, z, data.errorLimit);
    setSampleSizeResult(result);
  });

  // Error Limit Calculator
  const errorLimitForm = useForm<WorkSamplingErrorLimitInput>({
    resolver: zodResolver(workSamplingErrorLimitSchema),
    defaultValues: {
      proportion: 0.5,
      confidence: "0.95",
      sampleSize: 384,
    },
  });

  const [errorLimitResult, setErrorLimitResult] = useState<number | null>(null);

  const handleCalculateErrorLimit = errorLimitForm.handleSubmit((data) => {
    const z = getZValue(data.confidence);
    const result = calculateErrorLimit(data.proportion, z, data.sampleSize);
    setErrorLimitResult(result);
  });

  // Random Times Generator
  const randomTimesForm = useForm<WorkSamplingRandomTimesInput>({
    resolver: zodResolver(workSamplingRandomTimesSchema),
    defaultValues: {
      count: 10,
      startHour: 8,
      endHour: 17,
    },
  });

  const [randomTimes, setRandomTimes] = useState<string[]>([]);

  const handleGenerateRandomTimes = randomTimesForm.handleSubmit((data) => {
    const times = generateRandomObservationTimes(data.count, data.startHour, data.endHour);
    setRandomTimes(times);
  });

  const watchedSSConfidence = sampleSizeForm.watch("confidence");
  const watchedELConfidence = errorLimitForm.watch("confidence");
  const sampleSizeZ = getZValue(watchedSSConfidence);
  const errorLimitZ = getZValue(watchedELConfidence);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculate Sample Size (n) */}
        <form onSubmit={handleCalculateSampleSize}>
          <FormFrame title="Calculate Sample Size" description="Determine required observations">
            <FormInput
              label="Probability (p)"
              type="number"
              step="0.01"
              placeholder="0.50"
              hint="Enter a value between 0 and 1 (e.g., 0.5 for 50%)"
              error={sampleSizeForm.formState.errors.proportion?.message}
              {...sampleSizeForm.register("proportion", { valueAsNumber: true })}
            />

            <FormSelect
              label="Confidence Level"
              options={CONFIDENCE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
              value={watchedSSConfidence}
              onValueChange={(v) => sampleSizeForm.setValue("confidence", v as any)}
              error={sampleSizeForm.formState.errors.confidence?.message}
            />

            <FormInput
              label="z-Value"
              type="text"
              value={sampleSizeZ.toFixed(3)}
              disabled
              hint="Computed from confidence level"
            />

            <FormInput
              label="Error Limit (l)"
              type="number"
              step="0.01"
              placeholder="0.05"
              hint="Enter as decimal (e.g., 0.05 for ±5%)"
              error={sampleSizeForm.formState.errors.errorLimit?.message}
              {...sampleSizeForm.register("errorLimit", { valueAsNumber: true })}
            />

            <CalculateButton type="submit" fullWidth>
              Calculate Sample Size
            </CalculateButton>

            {sampleSizeResult !== null && (
              <ResultsDisplay
                title="Required Sample Size"
                items={[
                  { label: "n", value: sampleSizeResult.toLocaleString(), status: "success" },
                ]}
              />
            )}
          </FormFrame>
        </form>

        {/* Calculate Error Limit (l) */}
        <form onSubmit={handleCalculateErrorLimit}>
          <FormFrame title="Calculate Error Limit" description="Determine achievable precision">
            <FormInput
              label="Probability (p)"
              type="number"
              step="0.01"
              placeholder="0.50"
              hint="Enter a value between 0 and 1"
              error={errorLimitForm.formState.errors.proportion?.message}
              {...errorLimitForm.register("proportion", { valueAsNumber: true })}
            />

            <FormSelect
              label="Confidence Level"
              options={CONFIDENCE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
              value={watchedELConfidence}
              onValueChange={(v) => errorLimitForm.setValue("confidence", v as any)}
              error={errorLimitForm.formState.errors.confidence?.message}
            />

            <FormInput
              label="z-Value"
              type="text"
              value={errorLimitZ.toFixed(3)}
              disabled
              hint="Computed from confidence level"
            />

            <FormInput
              label="Sample Size (n)"
              type="number"
              placeholder="384"
              hint="Number of observations in the study"
              error={errorLimitForm.formState.errors.sampleSize?.message}
              {...errorLimitForm.register("sampleSize", { valueAsNumber: true })}
            />

            <CalculateButton type="submit" fullWidth>
              Calculate Error Limit
            </CalculateButton>

            {errorLimitResult !== null && (
              <ResultsDisplay
                title="Maximum Error Limit"
                items={[
                  {
                    label: "l",
                    value: formatErrorAsPercentage(errorLimitResult),
                    status: "success",
                  },
                  { label: "Decimal", value: errorLimitResult.toFixed(4) },
                ]}
              />
            )}
          </FormFrame>
        </form>
      </div>

      {/* Generate Random Observation Times */}
      <form onSubmit={handleGenerateRandomTimes}>
        <FormFrame title="Generate Random Observation Times" columns={2}>
          <FormInput
            label="Number of Observations"
            type="number"
            placeholder="10"
            hint="Maximum 10,000 observations"
            error={randomTimesForm.formState.errors.count?.message}
            {...randomTimesForm.register("count", { valueAsNumber: true })}
          />

          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full">
              <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
              Generate
            </Button>
          </div>

          {randomTimes.length > 0 && (
            <div className="col-span-2">
              <ResultsDisplay title={`${randomTimes.length} Random Times (8:00 AM - 5:00 PM)`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 font-mono text-sm">
                  {randomTimes.map((time, i) => (
                    <div key={i} className="text-center">
                      <span className="text-muted-foreground mr-1">{i + 1}.</span>
                      {time}
                    </div>
                  ))}
                </div>
              </ResultsDisplay>
            </div>
          )}
        </FormFrame>
      </form>

      <HelpPanel title="About Work Sampling">
        <p>
          Work sampling is an indirect work measurement technique that involves taking random
          observations of workers to determine the proportion of time spent on various activities.
        </p>
        <HelpPanel.Formula label="Sample Size Formula">
          n = z² × p × (1 - p) / l²
        </HelpPanel.Formula>
        <p>
          Where <strong>z</strong> is the z-value for the confidence level, <strong>p</strong> is
          the estimated proportion, and <strong>l</strong> is the desired error limit.
        </p>
        <HelpPanel.Reference>
          Niebel & Freivalds, "Methods, Standards, and Work Design", Ch. 13
        </HelpPanel.Reference>
      </HelpPanel>
    </div>
  );
}

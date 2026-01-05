import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, RotateCcw, Info, Brain, Keyboard } from "lucide-react";
import {
  analyzeResults,
  generateTrialSet,
  getColorFromKey,
  getColorKey,
  COLORS,
  type StroopTrial,
  type StroopResult,
  type ColorName,
} from "@/utils/calculations/stroop";

type TestState = "idle" | "countdown" | "running" | "complete";

const TRIALS_PER_TYPE = 10;

export function StroopTest() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<StroopResult | null>(null);
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);

  const currentTrial = trials[currentTrialIndex];

  const startTest = useCallback(() => {
    const newTrials = generateTrialSet(TRIALS_PER_TYPE);
    setTrials(newTrials);
    setCurrentTrialIndex(0);
    setResult(null);
    setTestState("countdown");
    setCountdown(3);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (testState !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTestState("running");
      setTrialStartTime(performance.now());
    }
  }, [testState, countdown]);

  // Keyboard handler
  useEffect(() => {
    if (testState !== "running" || !currentTrial) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const color = getColorFromKey(e.key);
      if (!color) return;

      handleResponse(color);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [testState, currentTrial, currentTrialIndex]);

  const handleResponse = (selectedColor: ColorName) => {
    if (!currentTrial || !trialStartTime) return;

    const responseTime = performance.now() - trialStartTime;
    const correct = selectedColor === currentTrial.correctAnswer;

    // Update trial
    const updatedTrials = [...trials];
    updatedTrials[currentTrialIndex] = {
      ...currentTrial,
      userAnswer: selectedColor,
      responseTime,
      correct,
      timestamp: Date.now(),
    };
    setTrials(updatedTrials);

    // Show feedback briefly
    setShowFeedback(correct ? "correct" : "incorrect");

    // Move to next trial
    setTimeout(() => {
      setShowFeedback(null);

      if (currentTrialIndex + 1 >= trials.length) {
        // Test complete
        setTestState("complete");
        const results = analyzeResults(updatedTrials);
        setResult(results);
      } else {
        setCurrentTrialIndex(currentTrialIndex + 1);
        setTrialStartTime(performance.now());
      }
    }, 300);
  };

  const resetTest = () => {
    setTestState("idle");
    setTrials([]);
    setCurrentTrialIndex(0);
    setResult(null);
    setShowFeedback(null);
  };

  const colorButtons = Object.entries(COLORS).map(([key, value]) => ({
    key: key as ColorName,
    ...value,
  }));

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Stroop Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Stroop Effect demonstrates cognitive interference when the brain processes
            conflicting information. Identify the <strong>ink color</strong> of each word
            as quickly as possible, ignoring what the word says. Use keyboard keys (R, G, B, Y)
            or click the color buttons.
          </p>
        </CardContent>
      </Card>

      {/* Test Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Test Area
            </CardTitle>
            <div className="flex gap-2">
              {testState === "idle" && (
                <Button onClick={startTest}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              )}
              {testState !== "idle" && (
                <Button variant="outline" onClick={resetTest}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {testState === "idle" && (
            <div className="min-h-[300px] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Click "Start Test" to begin</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Keyboard className="h-4 w-4" />
                  <span>Use R, G, B, Y keys or click buttons</span>
                </div>
              </div>
            </div>
          )}

          {testState === "countdown" && (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Get Ready!</p>
                <div className="text-8xl font-bold text-primary animate-pulse">
                  {countdown}
                </div>
              </div>
            </div>
          )}

          {testState === "running" && currentTrial && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Trial {currentTrialIndex + 1} of {trials.length}</span>
                <span>
                  Correct: {trials.filter(t => t.correct === true).length} / {trials.filter(t => t.correct !== null).length}
                </span>
              </div>

              {/* Stimulus */}
              <div className={`min-h-[200px] rounded-lg flex items-center justify-center transition-colors ${
                showFeedback === "correct" ? "bg-green-100 dark:bg-green-900/30" :
                showFeedback === "incorrect" ? "bg-red-100 dark:bg-red-900/30" :
                "bg-muted"
              }`}>
                <span
                  className="text-6xl md:text-8xl font-bold select-none"
                  style={{ color: COLORS[currentTrial.inkColor].hex }}
                >
                  {currentTrial.word}
                </span>
              </div>

              {/* Response buttons */}
              <div className="grid grid-cols-4 gap-3">
                {colorButtons.map((color) => (
                  <Button
                    key={color.key}
                    variant="outline"
                    className="h-16 text-lg font-bold border-2 hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: color.hex,
                      color: color.key === "yellow" ? "#000" : "#fff",
                      borderColor: color.hex,
                    }}
                    onClick={() => handleResponse(color.key)}
                  >
                    {getColorKey(color.key)}
                  </Button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Press the key or click the button matching the <strong>ink color</strong>
              </p>
            </div>
          )}

          {testState === "complete" && (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-lg font-medium">Test Complete!</p>
                <p className="text-muted-foreground">See your results below</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interference Effect */}
            <div className={`p-4 rounded-lg border ${
              result.interferenceEffect > 100
                ? "bg-primary/10 border-primary/20"
                : result.interferenceEffect > 50
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  : "bg-muted border-muted"
            }`}>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Stroop Interference Effect</div>
                <div className="text-4xl font-bold text-primary">
                  {result.interferenceEffect.toFixed(0)} ms
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  (Incongruent RT - Congruent RT)
                </div>
              </div>
            </div>

            {/* By Trial Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Congruent</div>
                <div className="text-2xl font-bold">{result.byType.congruent.meanRT.toFixed(0)} ms</div>
                <div className="text-sm text-muted-foreground">
                  {result.byType.congruent.accuracy.toFixed(0)}% accuracy
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">Incongruent</div>
                <div className="text-2xl font-bold">{result.byType.incongruent.meanRT.toFixed(0)} ms</div>
                <div className="text-sm text-muted-foreground">
                  {result.byType.incongruent.accuracy.toFixed(0)}% accuracy
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm font-medium">Neutral</div>
                <div className="text-2xl font-bold">{result.byType.neutral.meanRT.toFixed(0)} ms</div>
                <div className="text-sm text-muted-foreground">
                  {result.byType.neutral.accuracy.toFixed(0)}% accuracy
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted text-center">
                <div className="text-xs text-muted-foreground">Total Trials</div>
                <div className="text-lg font-bold">{result.totalTrials}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <div className="text-xs text-muted-foreground">Overall Accuracy</div>
                <div className="text-lg font-bold">{result.overallAccuracy.toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <div className="text-xs text-muted-foreground">Overall Mean RT</div>
                <div className="text-lg font-bold">{result.overallMeanRT.toFixed(0)} ms</div>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <div className="text-xs text-muted-foreground">Facilitation</div>
                <div className="text-lg font-bold">{result.facilitationEffect.toFixed(0)} ms</div>
              </div>
            </div>

            <Separator />

            {/* Interpretation */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-medium mb-2">Interpretation</h4>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </div>

            {/* Detailed Stats */}
            <div>
              <h4 className="font-medium mb-3">Detailed Statistics</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Condition</th>
                      <th className="text-right py-2">Mean</th>
                      <th className="text-right py-2">Median</th>
                      <th className="text-right py-2">Std Dev</th>
                      <th className="text-right py-2">Min</th>
                      <th className="text-right py-2">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["congruent", "incongruent", "neutral"] as const).map((type) => (
                      <tr key={type} className="border-b">
                        <td className="py-2 capitalize">{type}</td>
                        <td className="py-2 text-right font-mono">{result.byType[type].meanRT.toFixed(0)}</td>
                        <td className="py-2 text-right font-mono">{result.byType[type].medianRT.toFixed(0)}</td>
                        <td className="py-2 text-right font-mono">{result.byType[type].stdRT.toFixed(0)}</td>
                        <td className="py-2 text-right font-mono">{result.byType[type].minRT.toFixed(0)}</td>
                        <td className="py-2 text-right font-mono">{result.byType[type].maxRT.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Stroop Effect Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Congruent:</strong> Word matches ink color (e.g., "RED" in red ink).
              Fastest response times.
            </div>
            <div>
              <strong>Incongruent:</strong> Word differs from ink color (e.g., "RED" in blue ink).
              Creates interference, slowing responses.
            </div>
            <div>
              <strong>Neutral:</strong> Non-color word in colored ink (e.g., "TABLE" in red ink).
              Baseline condition.
            </div>
            <Separator />
            <p className="text-muted-foreground">
              Typical interference effects range from 50-150ms. Larger effects may indicate
              stronger automatic reading responses or difficulty with inhibitory control.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

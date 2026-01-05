import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, RotateCcw, Info, Target, TrendingUp } from "lucide-react";
import {
  analyzeFittsResults,
  calculateIndexOfDifficulty,
  generateTargetConfigurations,
  generateTargetPosition,
  checkHit,
  formatThroughput,
  interpretResults,
  type FittsTrial,
  type FittsResult,
} from "@/utils/calculations/fitts-law";

type TestState = "idle" | "running" | "complete";

const TRIALS_PER_CONFIG = 3;
const CONTAINER_WIDTH = 600;
const CONTAINER_HEIGHT = 400;

export function FittsLawTest() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [trials, setTrials] = useState<FittsTrial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [target, setTarget] = useState<{ x: number; y: number; width: number } | null>(null);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<FittsResult | null>(null);
  const [configs, setConfigs] = useState<Array<{ distance: number; width: number }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const startTest = useCallback(() => {
    const targetConfigs = generateTargetConfigurations(9);
    // Repeat each config for multiple trials
    const allConfigs: Array<{ distance: number; width: number }> = [];
    for (const config of targetConfigs) {
      for (let i = 0; i < TRIALS_PER_CONFIG; i++) {
        allConfigs.push(config);
      }
    }
    // Shuffle
    for (let i = allConfigs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allConfigs[i], allConfigs[j]] = [allConfigs[j], allConfigs[i]];
    }

    setConfigs(allConfigs);
    setTrials([]);
    setCurrentTrial(0);
    setResult(null);
    setTestState("running");

    // Set initial start position at center
    setStartPosition({ x: CONTAINER_WIDTH / 2, y: CONTAINER_HEIGHT / 2 });
    setTarget(null);
  }, []);

  const showNextTarget = useCallback(() => {
    if (currentTrial >= configs.length) {
      // Test complete
      setTestState("complete");
      const results = analyzeFittsResults(trials);
      setResult(results);
      return;
    }

    const config = configs[currentTrial];
    const originX = startPosition?.x ?? CONTAINER_WIDTH / 2;
    const originY = startPosition?.y ?? CONTAINER_HEIGHT / 2;

    const pos = generateTargetPosition(
      originX,
      originY,
      config.distance,
      CONTAINER_WIDTH,
      CONTAINER_HEIGHT,
      config.width
    );

    setTarget({ ...pos, width: config.width });
    setTrialStartTime(performance.now());
  }, [currentTrial, configs, startPosition, trials]);

  useEffect(() => {
    if (testState === "running" && startPosition && !target) {
      // Small delay before showing first target
      const timer = setTimeout(showNextTarget, 500);
      return () => clearTimeout(timer);
    }
  }, [testState, startPosition, target, showNextTarget]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (testState !== "running" || !target || !trialStartTime) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const movementTime = performance.now() - trialStartTime;

    const config = configs[currentTrial];
    const hit = checkHit(clickX, clickY, target.x, target.y, target.width);
    const id = calculateIndexOfDifficulty(config.distance, config.width);

    const trial: FittsTrial = {
      targetId: `trial-${currentTrial}`,
      distance: config.distance,
      width: config.width,
      indexOfDifficulty: id,
      movementTime,
      hit,
      startX: startPosition?.x ?? 0,
      startY: startPosition?.y ?? 0,
      endX: clickX,
      endY: clickY,
      targetX: target.x,
      targetY: target.y,
    };

    setTrials((prev) => [...prev, trial]);
    setStartPosition({ x: clickX, y: clickY });
    setTarget(null);
    setCurrentTrial((prev) => prev + 1);

    // Show next target after brief delay
    setTimeout(showNextTarget, 300);
  };

  const resetTest = () => {
    setTestState("idle");
    setTrials([]);
    setCurrentTrial(0);
    setTarget(null);
    setStartPosition(null);
    setResult(null);
    setConfigs([]);
  };

  const successRate = trials.length > 0
    ? (trials.filter(t => t.hit).length / trials.length * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Fitts' Law Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fitts' Law predicts movement time based on target distance and size. The formula
            MT = a + b × log₂(D/W + 1) describes the speed-accuracy tradeoff in aimed movements.
            Click targets as quickly and accurately as possible to measure your throughput.
          </p>
        </CardContent>
      </Card>

      {/* Test Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Target className="h-5 w-5" />
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
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center"
              style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
            >
              <p className="text-muted-foreground">Click "Start Test" to begin</p>
            </div>
          )}

          {testState === "running" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Trial {currentTrial + 1} of {configs.length}</span>
                <span>Hits: {trials.filter(t => t.hit).length} / {trials.length} ({successRate.toFixed(0)}%)</span>
              </div>
              <div
                ref={containerRef}
                className="relative bg-muted rounded-lg cursor-crosshair select-none"
                style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
                onClick={handleContainerClick}
              >
                {/* Start position indicator */}
                {startPosition && !target && (
                  <div
                    className="absolute w-4 h-4 bg-primary/50 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
                    style={{ left: startPosition.x, top: startPosition.y }}
                  />
                )}

                {/* Target */}
                {target && (
                  <div
                    className="absolute bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                    style={{
                      left: target.x,
                      top: target.y,
                      width: target.width,
                      height: target.width,
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {testState === "complete" && result && (
            <div
              className="border-2 border-primary/20 bg-primary/5 rounded-lg flex items-center justify-center"
              style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
            >
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
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
            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground">Throughput</div>
                <div className="text-2xl font-bold text-primary">
                  {formatThroughput(result.throughput)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Avg Movement Time</div>
                <div className="text-2xl font-bold">
                  {result.averageMovementTime.toFixed(0)} ms
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Error Rate</div>
                <div className={`text-2xl font-bold ${result.errorRate > 10 ? 'text-red-500' : ''}`}>
                  {result.errorRate.toFixed(1)}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">R²</div>
                <div className={`text-2xl font-bold ${result.rSquared >= 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {result.rSquared.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Regression Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground">Intercept (a)</div>
                <div className="text-xl font-mono">{result.intercept.toFixed(1)} ms</div>
                <div className="text-xs text-muted-foreground">Start-up/reaction time</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground">Slope (b)</div>
                <div className="text-xl font-mono">{result.slope.toFixed(1)} ms/bit</div>
                <div className="text-xs text-muted-foreground">Information processing rate</div>
              </div>
            </div>

            <Separator />

            {/* Interpretation */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-medium mb-2">Interpretation</h4>
              <p className="text-sm text-muted-foreground">{interpretResults(result)}</p>
            </div>

            {/* Fitts' Law Formula */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Fitts' Law Model</h4>
              <p className="text-sm font-mono">
                MT = {result.intercept.toFixed(1)} + {result.slope.toFixed(1)} × ID
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Where ID = log₂(D/W + 1) is the Index of Difficulty
              </p>
            </div>

            {/* Trial Summary */}
            <div>
              <h4 className="font-medium mb-3">Trial Summary</h4>
              <div className="text-sm text-muted-foreground">
                <p>Total trials: {result.totalTrials}</p>
                <p>Successful hits: {result.successfulTrials}</p>
                <p>Unique difficulty levels tested: {result.trialsByDifficulty.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Fitts' Law Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Throughput (IP)</strong>: Index of Performance in bits/second.
              Typical mouse pointing: 3-5 bits/s.
            </div>
            <div>
              <strong>R²</strong>: Coefficient of determination. Values ≥0.90 indicate
              excellent fit to Fitts' Law model.
            </div>
            <div>
              <strong>Error Rate</strong>: Target misses. Rates &gt;4% may indicate
              speed-accuracy tradeoff issues.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

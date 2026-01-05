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
import { Calculator, AlertTriangle, CheckCircle, Info } from "lucide-react";
import {
  calculateNIOSH,
  formatWeight,
  type NIOSHInputs,
  type NIOSHResult,
  type Unit,
} from "@/utils/calculations/niosh-lifting";

export function NIOSHCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [inputs, setInputs] = useState<Omit<NIOSHInputs, "unit">>({
    horizontalDistance: 40,
    verticalDistance: 75,
    travelDistance: 25,
    asymmetricAngle: 0,
    frequency: 1,
    duration: "moderate",
    coupling: "good",
    loadWeight: 15,
  });
  const [result, setResult] = useState<NIOSHResult | null>(null);

  const handleCalculate = () => {
    const nioshInputs: NIOSHInputs = { ...inputs, unit };
    const calcResult = calculateNIOSH(nioshInputs);
    setResult(calcResult);
  };

  const updateInput = (field: keyof typeof inputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "acceptable":
        return "text-green-600 dark:text-green-400";
      case "increased":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "acceptable":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "increased":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
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
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Distance inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horizontal">
                Horizontal Distance ({unit === "metric" ? "cm" : "in"})
              </Label>
              <Input
                id="horizontal"
                type="number"
                min={unit === "metric" ? 25 : 10}
                max={unit === "metric" ? 63 : 25}
                value={inputs.horizontalDistance}
                onChange={(e) => updateInput("horizontalDistance", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Distance from midpoint between ankles to hands
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical">
                Vertical Location ({unit === "metric" ? "cm" : "in"})
              </Label>
              <Input
                id="vertical"
                type="number"
                min={0}
                max={unit === "metric" ? 175 : 70}
                value={inputs.verticalDistance}
                onChange={(e) => updateInput("verticalDistance", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Height of hands from floor at lift origin
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel">
                Travel Distance ({unit === "metric" ? "cm" : "in"})
              </Label>
              <Input
                id="travel"
                type="number"
                min={unit === "metric" ? 25 : 10}
                value={inputs.travelDistance}
                onChange={(e) => updateInput("travelDistance", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Vertical distance the load is moved
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="angle">Asymmetric Angle (°)</Label>
              <Input
                id="angle"
                type="number"
                min={0}
                max={135}
                value={inputs.asymmetricAngle}
                onChange={(e) => updateInput("asymmetricAngle", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Angular displacement from sagittal plane (0-135°)
              </p>
            </div>
          </div>

          <Separator />

          {/* Frequency and duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency (lifts/min)</Label>
              <Input
                id="frequency"
                type="number"
                min={0.2}
                max={15}
                step={0.1}
                value={inputs.frequency}
                onChange={(e) => updateInput("frequency", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={inputs.duration}
                onValueChange={(v) => updateInput("duration", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (&lt; 1 hr)</SelectItem>
                  <SelectItem value="moderate">Moderate (1-2 hrs)</SelectItem>
                  <SelectItem value="long">Long (2-8 hrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Coupling Quality</Label>
              <Select
                value={inputs.coupling}
                onValueChange={(v) => updateInput("coupling", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good (handles, cut-outs)</SelectItem>
                  <SelectItem value="fair">Fair (adequate grip)</SelectItem>
                  <SelectItem value="poor">Poor (bulky, slippery)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Load weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Actual Load Weight ({unit === "metric" ? "kg" : "lb"})
            </Label>
            <Input
              id="weight"
              type="number"
              min={0}
              value={inputs.loadWeight}
              onChange={(e) => updateInput("loadWeight", parseFloat(e.target.value) || 0)}
              className="max-w-xs"
            />
          </div>

          <Button onClick={handleCalculate} className="w-full md:w-auto">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate RWL & Lifting Index
          </Button>
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
            <div className={`p-4 rounded-lg border ${getRiskBg(result.riskLevel)}`}>
              <div className="flex items-start gap-3">
                {result.riskLevel === "acceptable" ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle
                    className={`h-6 w-6 flex-shrink-0 ${getRiskColor(result.riskLevel)}`}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <div>
                      <div className="text-sm text-muted-foreground">Lifting Index</div>
                      <div className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                        {result.liftingIndex.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Recommended Weight Limit</div>
                      <div className="text-2xl font-semibold">
                        {formatWeight(result.rwl, unit)}
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
                  const isLimiting = result.limitingFactor.toLowerCase().includes(labels[key].toLowerCase());
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg text-center ${
                        isLimiting ? "bg-yellow-100 dark:bg-yellow-900/30 ring-1 ring-yellow-400" : "bg-muted"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {labels[key]}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {value.toFixed(2)}
                      </div>
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
              <p className="text-sm font-mono">
                RWL = LC × HM × VM × DM × AM × FM × CM
              </p>
              <p className="text-sm font-mono mt-1">
                RWL = {unit === "metric" ? "23" : "51"} × {result.multipliers.hm.toFixed(2)} × {result.multipliers.vm.toFixed(2)} × {result.multipliers.dm.toFixed(2)} × {result.multipliers.am.toFixed(2)} × {result.multipliers.fm.toFixed(2)} × {result.multipliers.cm.toFixed(2)}
              </p>
              <p className="text-sm font-mono mt-1">
                RWL = {result.rwl.toFixed(1)} {unit === "metric" ? "kg" : "lb"}
              </p>
              <p className="text-sm font-mono mt-2">
                LI = Load / RWL = {inputs.loadWeight} / {result.rwl.toFixed(1)} = {result.liftingIndex.toFixed(2)}
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
              <span><strong>LI ≤ 1.0:</strong> Acceptable - minimal risk for most workers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span><strong>1.0 &lt; LI ≤ 3.0:</strong> Increased risk - consider task redesign</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span><strong>LI &gt; 3.0:</strong> High risk - task redesign required</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

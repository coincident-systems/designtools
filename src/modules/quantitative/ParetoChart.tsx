import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Plus, Trash2, Info, Sparkles, RotateCcw } from "lucide-react";
import {
  analyzePareto,
  formatParetoValue,
  generateSampleData,
  type ParetoItem,
  type ParetoResult,
} from "@/utils/calculations/pareto";

interface DataEntry {
  category: string;
  value: string;
}

export function ParetoChart() {
  const [entries, setEntries] = useState<DataEntry[]>([
    { category: "", value: "" },
    { category: "", value: "" },
    { category: "", value: "" },
  ]);
  const [valueLabel, setValueLabel] = useState("Count");
  const [result, setResult] = useState<ParetoResult | null>(null);

  const handleAnalyze = () => {
    const items: ParetoItem[] = entries
      .filter((e) => e.category.trim() && parseFloat(e.value) > 0)
      .map((e, i) => ({
        id: `item-${i}`,
        category: e.category.trim(),
        value: parseFloat(e.value),
      }));

    if (items.length < 2) {
      return;
    }

    const analysis = analyzePareto(items, 80);
    setResult(analysis);
  };

  const addEntry = () => {
    if (entries.length < 20) {
      setEntries([...entries, { category: "", value: "" }]);
    }
  };

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof DataEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const loadSampleData = () => {
    const sample = generateSampleData();
    setEntries(sample.map((s) => ({ category: s.category, value: s.value.toString() })));
    setValueLabel("Defects");
  };

  const resetData = () => {
    setEntries([
      { category: "", value: "" },
      { category: "", value: "" },
      { category: "", value: "" },
    ]);
    setResult(null);
    setValueLabel("Count");
  };

  const maxValue = result ? Math.max(...result.items.map((i) => i.value)) : 0;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Pareto Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pareto analysis applies the 80/20 rule to identify the "vital few" causes that
            account for the majority of effects. Focus improvement efforts on the top categories
            to achieve maximum impact with minimum effort.
          </p>
        </CardContent>
      </Card>

      {/* Data Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Data Entry
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                <Sparkles className="h-4 w-4 mr-1" />
                Sample Data
              </Button>
              <Button variant="outline" size="sm" onClick={addEntry} disabled={entries.length >= 20}>
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valueLabel">Value Label</Label>
            <Input
              id="valueLabel"
              value={valueLabel}
              onChange={(e) => setValueLabel(e.target.value)}
              placeholder="e.g., Count, Cost, Time"
              className="max-w-xs"
            />
          </div>

          <Separator />

          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Category</div>
            <div className="col-span-4">{valueLabel}</div>
            <div className="col-span-1"></div>
          </div>

          {/* Data Rows */}
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-sm text-muted-foreground">
                  {index + 1}.
                </div>
                <div className="col-span-6">
                  <Input
                    placeholder="Category name"
                    value={entry.category}
                    onChange={(e) => updateEntry(index, "category", e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={entry.value}
                    onChange={(e) => updateEntry(index, "value", e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(index)}
                    disabled={entries.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} className="flex-1 md:flex-none">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Pareto Chart
            </Button>
            <Button variant="outline" onClick={resetData}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && result.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Pareto Chart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground">Vital Few</div>
                <div className="text-2xl font-bold text-primary">
                  {result.vitalFewCount} of {result.items.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  ({((result.vitalFewCount / result.items.length) * 100).toFixed(0)}% of categories)
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground">Account For</div>
                <div className="text-2xl font-bold text-primary">
                  {result.vitalFewPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  of total {valueLabel.toLowerCase()}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Total {valueLabel}</div>
                <div className="text-2xl font-bold">
                  {formatParetoValue(result.totalValue)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="text-2xl font-bold">{result.items.length}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-end gap-1 h-48">
                {result.items.map((item) => {
                  const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex-1 flex flex-col items-center"
                      title={`${item.category}: ${item.value} (${item.percentage.toFixed(1)}%)`}
                    >
                      <div className="text-xs text-muted-foreground mb-1 truncate w-full text-center">
                        {item.percentage.toFixed(0)}%
                      </div>
                      <div className="w-full flex flex-col items-center relative h-36">
                        {/* Bar */}
                        <div
                          className={`w-3/4 rounded-t transition-all ${
                            item.isVitalFew ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                          style={{ height: `${barHeight}%`, marginTop: "auto" }}
                        />
                        {/* Cumulative line point */}
                        <div
                          className="absolute w-2 h-2 rounded-full bg-accent border-2 border-background"
                          style={{
                            bottom: `${item.cumulativePercentage * 0.36}%`,
                            transform: "translateY(50%)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex gap-1 mt-2">
                {result.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex-1 text-xs text-center truncate px-1"
                    title={item.category}
                  >
                    {item.category.length > 10
                      ? item.category.substring(0, 8) + "..."
                      : item.category}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Vital Few (≤80%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted-foreground/30 rounded" />
                  <span>Trivial Many</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full border border-background" />
                  <span>Cumulative %</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vital Few List */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium mb-2">Vital Few - Focus Areas</h4>
              <p className="text-sm text-muted-foreground mb-3">
                These {result.vitalFewCount} categories account for{" "}
                {result.vitalFewPercentage.toFixed(1)}% of the total. Prioritize improvement
                efforts here for maximum impact.
              </p>
              <ul className="text-sm space-y-1">
                {result.vitalFewCategories.map((cat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="font-medium">{i + 1}.</span>
                    <span>{cat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Table */}
            <div>
              <h4 className="font-medium mb-3">Detailed Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Rank</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">{valueLabel}</th>
                      <th className="text-right py-2">%</th>
                      <th className="text-right py-2">Cumulative %</th>
                      <th className="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b ${item.isVitalFew ? "bg-primary/5" : ""}`}
                      >
                        <td className="py-2">{item.rank}</td>
                        <td className="py-2">{item.category}</td>
                        <td className="py-2 text-right font-mono">{item.value.toFixed(1)}</td>
                        <td className="py-2 text-right font-mono">{item.percentage.toFixed(1)}%</td>
                        <td className="py-2 text-right font-mono">
                          {item.cumulativePercentage.toFixed(1)}%
                        </td>
                        <td className="py-2 text-center">
                          {item.isVitalFew ? (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                              Vital Few
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Trivial Many</span>
                          )}
                        </td>
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
          <CardTitle className="text-lg">Pareto Principle Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>80/20 Rule:</strong> Approximately 80% of effects come from 20% of causes.
              Also known as the "law of the vital few."
            </div>
            <div>
              <strong>Vital Few:</strong> The small number of categories that contribute most
              to the total. Focus improvement efforts here.
            </div>
            <div>
              <strong>Trivial Many:</strong> The larger number of categories that contribute
              less. Address after vital few are resolved.
            </div>
            <Separator />
            <p className="text-muted-foreground">
              Applications: Quality defects, customer complaints, inventory costs, project delays,
              safety incidents, machine downtime.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

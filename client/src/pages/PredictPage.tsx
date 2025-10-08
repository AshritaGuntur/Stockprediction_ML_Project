import { useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartContainer from "@/components/ChartContainer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// TODO: remove mock functionality
const mockPredictionData = [
  { date: "Day 1", actual: 182, predicted: 182 },
  { date: "Day 2", actual: 183, predicted: 183.5 },
  { date: "Day 3", actual: 181, predicted: 182 },
  { date: "Day 4", actual: null, predicted: 185 },
  { date: "Day 5", actual: null, predicted: 186.5 },
  { date: "Day 6", actual: null, predicted: 187 },
  { date: "Day 7", actual: null, predicted: 188.2 },
];

export default function PredictPage() {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = () => {
    console.log("Predicting for:", symbol);
    // TODO: remove mock functionality
    setPrediction({
      symbol: symbol.toUpperCase(),
      expectedGrowth: 2.8,
      volatility: 1.2,
      insight: `StockSight predicts ${symbol.toUpperCase()} may rise 2.8% next week with moderate volatility.`,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Stock Predictions</h1>
          <p className="text-muted-foreground">
            Get ML-based predictions for the next 7 days
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handlePredict()}
                data-testid="input-predict-symbol"
              />
              <Button onClick={handlePredict} data-testid="button-predict">
                <Sparkles className="h-4 w-4 mr-2" />
                Predict Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-base">Expected Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <p className="text-3xl font-bold text-green-500" data-testid="text-expected-growth">
                      +{prediction.expectedGrowth}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-base">Volatility Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold" data-testid="text-volatility">
                    {prediction.volatility}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Moderate risk</p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm" data-testid="text-ai-insight">{prediction.insight}</p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <ChartContainer
                title={`${prediction.symbol} - 7 Day Forecast`}
                subtitle={`Prediction generated: ${new Date().toLocaleString()}`}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Actual"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {!prediction && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Enter a stock symbol to see AI-powered predictions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

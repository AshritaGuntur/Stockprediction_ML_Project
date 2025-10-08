import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartContainer from "@/components/ChartContainer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// TODO: remove mock functionality
const mockComparisonData = [
  { date: "Jan 1", stock1: 175, stock2: 135 },
  { date: "Jan 8", stock1: 178, stock2: 137 },
  { date: "Jan 15", stock1: 176, stock2: 136 },
  { date: "Jan 22", stock1: 182, stock2: 139 },
  { date: "Jan 29", stock1: 180, stock2: 138 },
];

export default function ComparePage() {
  const [symbol1, setSymbol1] = useState("");
  const [symbol2, setSymbol2] = useState("");
  const [comparison, setComparison] = useState<any>(null);

  const handleCompare = () => {
    console.log("Comparing:", symbol1, "vs", symbol2);
    // TODO: remove mock functionality
    setComparison({
      symbol1: symbol1.toUpperCase(),
      symbol2: symbol2.toUpperCase(),
      data: mockComparisonData,
      metrics: {
        sevenDayChange1: 2.85,
        sevenDayChange2: 2.96,
        oneMonthTrend1: "Upward",
        oneMonthTrend2: "Upward",
        marketCapDiff: 1250000000000,
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Stocks</h1>
          <p className="text-muted-foreground">
            Side-by-side analysis of two stocks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            type="text"
            placeholder="First stock symbol"
            value={symbol1}
            onChange={(e) => setSymbol1(e.target.value.toUpperCase())}
            data-testid="input-compare-symbol1"
          />
          <Input
            type="text"
            placeholder="Second stock symbol"
            value={symbol2}
            onChange={(e) => setSymbol2(e.target.value.toUpperCase())}
            data-testid="input-compare-symbol2"
          />
          <Button onClick={handleCompare} data-testid="button-compare">
            <TrendingUp className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>

        {comparison && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-sm text-muted-foreground">
                    7-Day % Change
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{comparison.symbol1}</p>
                      <p className="text-2xl font-bold text-green-500" data-testid="text-7day-1">
                        +{comparison.metrics.sevenDayChange1}%
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-sm font-medium">{comparison.symbol2}</p>
                      <p className="text-2xl font-bold text-green-500" data-testid="text-7day-2">
                        +{comparison.metrics.sevenDayChange2}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-sm text-muted-foreground">
                    1-Month Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{comparison.symbol1}</p>
                      <p className="text-lg font-bold" data-testid="text-trend-1">
                        {comparison.metrics.oneMonthTrend1}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-sm font-medium">{comparison.symbol2}</p>
                      <p className="text-lg font-bold" data-testid="text-trend-2">
                        {comparison.metrics.oneMonthTrend2}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0">
                  <CardTitle className="text-sm text-muted-foreground">
                    Market Cap Difference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-marketcap-diff">
                    ${(comparison.metrics.marketCapDiff / 1000000000000).toFixed(2)}T
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {comparison.symbol1} leads
                  </p>
                </CardContent>
              </Card>
            </div>

            <ChartContainer
              title={`${comparison.symbol1} vs ${comparison.symbol2}`}
              subtitle={`Comparison as of ${new Date().toLocaleString()}`}
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparison.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stock1"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name={comparison.symbol1}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock2"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name={comparison.symbol2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {!comparison && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Enter two stock symbols to compare their performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

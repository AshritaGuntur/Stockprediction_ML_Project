import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartContainer from "@/components/ChartContainer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { compareStocks } from "@/lib/api";
import type { ComparisonData } from "@shared/schema";

export default function ComparePage() {
  const [symbol1, setSymbol1] = useState("");
  const [symbol2, setSymbol2] = useState("");
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!symbol1.trim() || !symbol2.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await compareStocks(symbol1, symbol2);
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare stocks");
      setComparison(null);
    } finally {
      setLoading(false);
    }
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
          <Button onClick={handleCompare} disabled={loading} data-testid="button-compare">
            <TrendingUp className="h-4 w-4 mr-2" />
            {loading ? "Comparing..." : "Compare"}
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}
        
        {loading && <LoadingSpinner />}
        
        {comparison && !loading && (
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
                      <p className="text-sm font-medium">{comparison.symbol1.symbol}</p>
                      <p className={`text-2xl font-bold ${comparison.comparison.sevenDayChange1 >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-7day-1">
                        {comparison.comparison.sevenDayChange1 >= 0 ? '+' : ''}{comparison.comparison.sevenDayChange1}%
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-sm font-medium">{comparison.symbol2.symbol}</p>
                      <p className={`text-2xl font-bold ${comparison.comparison.sevenDayChange2 >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-7day-2">
                        {comparison.comparison.sevenDayChange2 >= 0 ? '+' : ''}{comparison.comparison.sevenDayChange2}%
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
                      <p className="text-sm font-medium">{comparison.symbol1.symbol}</p>
                      <p className="text-lg font-bold" data-testid="text-trend-1">
                        {comparison.comparison.oneMonthTrend1}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-sm font-medium">{comparison.symbol2.symbol}</p>
                      <p className="text-lg font-bold" data-testid="text-trend-2">
                        {comparison.comparison.oneMonthTrend2}
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
                    ${(comparison.comparison.marketCapDiff / 1000000000000).toFixed(2)}T
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Difference
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Investment Recommendation Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  Investment Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      {comparison.comparison.sevenDayChange1 > comparison.comparison.sevenDayChange2
                        ? `📈 ${comparison.symbol1.symbol} Shows Stronger Momentum`
                        : comparison.comparison.sevenDayChange2 > comparison.comparison.sevenDayChange1
                        ? `📈 ${comparison.symbol2.symbol} Shows Stronger Momentum`
                        : "⚖️ Both Stocks Show Similar Recent Performance"
                      }
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {comparison.comparison.sevenDayChange1 > comparison.comparison.sevenDayChange2
                        ? `${comparison.symbol1.symbol} has performed better in the last 7 days with ${comparison.comparison.sevenDayChange1 > 0 ? 'positive' : 'negative'} growth of ${Math.abs(comparison.comparison.sevenDayChange1)}%, compared to ${comparison.symbol2.symbol}'s ${Math.abs(comparison.comparison.sevenDayChange2)}%.`
                        : comparison.comparison.sevenDayChange2 > comparison.comparison.sevenDayChange1
                        ? `${comparison.symbol2.symbol} has performed better in the last 7 days with ${comparison.comparison.sevenDayChange2 > 0 ? 'positive' : 'negative'} growth of ${Math.abs(comparison.comparison.sevenDayChange2)}%, compared to ${comparison.symbol1.symbol}'s ${Math.abs(comparison.comparison.sevenDayChange1)}%.`
                        : `Both stocks have shown comparable performance in the last week, making this a balanced comparison.`
                      }
                    </p>
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-800">
                        💡 Investment Insight: {comparison.comparison.sevenDayChange1 > comparison.comparison.sevenDayChange2
                          ? `Consider ${comparison.symbol1.symbol} for short-term opportunities`
                          : comparison.comparison.sevenDayChange2 > comparison.comparison.sevenDayChange1
                          ? `Consider ${comparison.symbol2.symbol} for short-term opportunities`
                          : "Both stocks warrant further analysis for your investment goals"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ChartContainer
              title={`${comparison.symbol1.symbol} vs ${comparison.symbol2.symbol}`}
              subtitle={`Comparison as of ${new Date().toLocaleString()}`}
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparison.chartData}>
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
                    dataKey="price1"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name={comparison.symbol1.symbol}
                  />
                  <Line
                    type="monotone"
                    dataKey="price2"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name={comparison.symbol2.symbol}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {!comparison && !loading && (
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

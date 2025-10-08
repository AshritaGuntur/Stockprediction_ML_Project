import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockCard from "@/components/StockCard";
import ChartContainer from "@/components/ChartContainer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStock, getStockHistory } from "@/lib/api";
import type { StockData, ChartDataPoint } from "@shared/schema";

// Default stocks to display
const defaultStocks = ["AAPL", "GOOGL", "MSFT"];

export default function HomePage() {
  const [symbol, setSymbol] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentStocks, setRecentStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default stocks on mount
  useEffect(() => {
    loadDefaultStocks();
  }, []);

  const loadDefaultStocks = async () => {
    try {
      const stocks = await Promise.all(
        defaultStocks.map(sym => getStock(sym).catch(() => null))
      );
      setRecentStocks(stocks.filter(s => s !== null) as StockData[]);
    } catch (err) {
      console.error("Error loading default stocks:", err);
    }
  };

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [stockData, historyData] = await Promise.all([
        getStock(symbol),
        getStockHistory(symbol, "1M")
      ]);
      
      setSelectedStock(stockData);
      setChartData(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      setSelectedStock(null);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Empower your Investments with AI-driven Insights
          </h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Real-time predictions, analysis, and market intelligence
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                data-testid="input-stock-search"
              />
              <Button
                onClick={handleSearch}
                variant="secondary"
                disabled={loading}
                data-testid="button-search"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorMessage message={error} />}
        
        {loading && <LoadingSpinner />}
        
        {selectedStock && !loading && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-current-price">
                    ${selectedStock.price}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-volume">
                    {(selectedStock.volume / 1000000).toFixed(1)}M
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-market-cap">
                    ${(selectedStock.marketCap / 1000000000000).toFixed(2)}T
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Change
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {selectedStock.changePercent >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <p className={`text-lg font-bold ${selectedStock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-trend">
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {chartData.length > 0 && (
              <ChartContainer
                title={`${selectedStock.symbol} - 30 Day Performance`}
                subtitle={`Last updated: ${new Date(selectedStock.lastUpdated).toLocaleString()}`}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
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
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        )}

        {!loading && recentStocks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Popular Stocks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentStocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  {...stock}
                  onClick={() => {
                    setSymbol(stock.symbol);
                    handleSearch();
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

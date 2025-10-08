import { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockCard from "@/components/StockCard";
import ChartContainer from "@/components/ChartContainer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// TODO: remove mock functionality
const mockChartData = [
  { date: "Jan 1", price: 175 },
  { date: "Jan 8", price: 178 },
  { date: "Jan 15", price: 176 },
  { date: "Jan 22", price: 182 },
  { date: "Jan 29", price: 180 },
  { date: "Feb 5", price: 185 },
  { date: "Feb 12", price: 188 },
];

const mockRecentStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.45, change: 3.25, changePercent: 1.81 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 139.82, change: -1.15, changePercent: -0.82 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.91, change: 5.42, changePercent: 1.45 },
];

export default function HomePage() {
  const [symbol, setSymbol] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);

  const handleSearch = () => {
    console.log("Searching for:", symbol);
    // TODO: remove mock functionality
    setSelectedStock({
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company`,
      price: 182.45,
      open: 179.20,
      close: 182.45,
      volume: 52847392,
      marketCap: 2847392847392,
      change: 3.25,
      changePercent: 1.81,
      trend: "Uptrend",
    });
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
                data-testid="button-search"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedStock && (
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
                    Trend Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {selectedStock.trend === "Uptrend" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <p className="text-lg font-bold" data-testid="text-trend">
                      {selectedStock.trend}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ChartContainer
              title={`${selectedStock.symbol} - 30 Day Performance`}
              subtitle={`Last updated: ${new Date().toLocaleString()}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
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
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRecentStocks.map((stock) => (
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
      </div>
    </div>
  );
}

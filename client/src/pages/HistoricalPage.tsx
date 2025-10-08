import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChartContainer from "@/components/ChartContainer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getStockHistory } from "@/lib/api";
import type { ChartDataPoint } from "@shared/schema";

export default function HistoricalPage() {
  const [symbol, setSymbol] = useState("");
  const [range, setRange] = useState("1M");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const historyData = await getStockHistory(symbol, range);
      setData(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch historical data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (data.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Price', 'MA10', 'MA50', 'MA200'];
    const rows = data.map(d => [
      d.date,
      d.price,
      d.ma10 || '',
      d.ma50 || '',
      d.ma200 || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_${range}_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Historical Data</h1>
          <p className="text-muted-foreground">
            View stock performance with moving averages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            type="text"
            placeholder="Enter stock symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            data-testid="input-historical-symbol"
          />
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="5Y">5 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading} data-testid="button-search-historical">
            <Calendar className="h-4 w-4 mr-2" />
            {loading ? "Loading..." : "Load Data"}
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}
        
        {loading && <LoadingSpinner />}
        
        {data.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{symbol.toUpperCase()}</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
              <Button variant="outline" onClick={handleDownload} data-testid="button-download-csv">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>

            <ChartContainer
              title={`${symbol.toUpperCase()} - ${range} Historical Performance`}
              subtitle="Including moving averages (MA10, MA50, MA200)"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
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
                    dataKey="price"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma10"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="MA10"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma50"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="MA50"
                  />
                  {data[0]?.ma200 && (
                    <Line
                      type="monotone"
                      dataKey="ma200"
                      stroke="hsl(var(--chart-5))"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      name="MA200"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {data.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Select a stock and time range to view historical data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

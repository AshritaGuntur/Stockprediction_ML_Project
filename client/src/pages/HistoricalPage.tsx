import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChartContainer from "@/components/ChartContainer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// TODO: remove mock functionality
const mockHistoricalData = {
  "1M": [
    { date: "Jan 1", price: 175, ma10: 173, ma50: 170 },
    { date: "Jan 8", price: 178, ma10: 175, ma50: 171 },
    { date: "Jan 15", price: 176, ma10: 176, ma50: 172 },
    { date: "Jan 22", price: 182, ma10: 178, ma50: 173 },
  ],
  "6M": [
    { date: "Aug", price: 165, ma10: 163, ma50: 160, ma200: 155 },
    { date: "Sep", price: 170, ma10: 167, ma50: 163, ma200: 157 },
    { date: "Oct", price: 168, ma10: 168, ma50: 165, ma200: 159 },
    { date: "Nov", price: 175, ma10: 171, ma50: 168, ma200: 161 },
    { date: "Dec", price: 180, ma10: 174, ma50: 170, ma200: 163 },
    { date: "Jan", price: 182, ma10: 177, ma50: 172, ma200: 165 },
  ],
  "1Y": [
    { date: "Q1", price: 150, ma10: 148, ma50: 145, ma200: 140 },
    { date: "Q2", price: 160, ma10: 155, ma50: 150, ma200: 145 },
    { date: "Q3", price: 165, ma10: 162, ma50: 158, ma200: 150 },
    { date: "Q4", price: 182, ma10: 175, ma50: 168, ma200: 160 },
  ],
};

export default function HistoricalPage() {
  const [symbol, setSymbol] = useState("");
  const [range, setRange] = useState("1M");
  const [data, setData] = useState<any>(null);

  const handleSearch = () => {
    console.log("Fetching historical data for:", symbol, range);
    // TODO: remove mock functionality
    setData({
      symbol: symbol.toUpperCase(),
      range,
      chartData: mockHistoricalData[range as keyof typeof mockHistoricalData],
    });
  };

  const handleDownload = () => {
    console.log("Downloading CSV for:", symbol);
    // TODO: implement CSV download
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
          <Button onClick={handleSearch} data-testid="button-search-historical">
            <Calendar className="h-4 w-4 mr-2" />
            Load Data
          </Button>
        </div>

        {data && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{data.symbol}</h2>
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
              title={`${data.symbol} - ${data.range} Historical Performance`}
              subtitle="Including moving averages (MA10, MA50, MA200)"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.chartData}>
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
                  {data.chartData[0]?.ma200 && (
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

        {!data && (
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

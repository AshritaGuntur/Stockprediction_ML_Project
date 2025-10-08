import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  onClick?: () => void;
}

export default function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  onClick,
}: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <Card
      className={`hover-elevate transition-all cursor-pointer ${onClick ? 'active-elevate-2' : ''}`}
      onClick={onClick}
      data-testid={`card-stock-${symbol}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{symbol}</p>
            <p className="text-xs text-muted-foreground mt-1">{name}</p>
          </div>
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold" data-testid={`text-price-${symbol}`}>
            ${price.toFixed(2)}
          </p>
          <p
            className={`text-sm mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}
            data-testid={`text-change-${symbol}`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)} ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

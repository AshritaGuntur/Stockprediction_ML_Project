import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stock data types
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  ma10?: number;
  ma50?: number;
  ma200?: number;
}

export interface PredictionData {
  symbol: string;
  actual: ChartDataPoint[];
  predicted: ChartDataPoint[];
  confidenceInterval: {
    date: string;
    lower: number;
    upper: number;
  }[];
  insight: string;
  expectedGrowth: number;
  volatility: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publishedAt: string;
}

export interface ComparisonData {
  symbol1: StockData;
  symbol2: StockData;
  chartData: {
    date: string;
    price1: number;
    price2: number;
  }[];
  comparison: {
    sevenDayChange1: number;
    sevenDayChange2: number;
    oneMonthTrend1: string;
    oneMonthTrend2: string;
    marketCapDiff: number;
  };
}

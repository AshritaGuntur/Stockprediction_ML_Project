import type { StockData, ChartDataPoint, PredictionData, NewsArticle, ComparisonData } from '@shared/schema';

const BASE_URL = '/api';

export async function getStock(symbol: string): Promise<StockData> {
  const res = await fetch(`${BASE_URL}/stock/${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch stock data');
  return res.json();
}

export async function getStockHistory(symbol: string, range: string = '1M'): Promise<ChartDataPoint[]> {
  const res = await fetch(`${BASE_URL}/stock/${symbol}/history?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch stock history');
  return res.json();
}

export async function getPrediction(symbol: string): Promise<PredictionData> {
  const res = await fetch(`${BASE_URL}/predict/${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch prediction');
  return res.json();
}

export async function getNews(symbol: string): Promise<NewsArticle[]> {
  const res = await fetch(`${BASE_URL}/news/${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function compareStocks(symbol1: string, symbol2: string): Promise<ComparisonData> {
  const res = await fetch(`${BASE_URL}/compare?symbol1=${symbol1}&symbol2=${symbol2}`);
  if (!res.ok) throw new Error('Failed to compare stocks');
  return res.json();
}

import { useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { getNews } from "@/lib/api";
import type { NewsArticle } from "@shared/schema";

export default function NewsPage() {
  const [symbol, setSymbol] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newsData = await getNews(symbol);
      setNews(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "🟢";
      case "negative":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Market News & Sentiment</h1>
          <p className="text-muted-foreground">
            Real-time news with sentiment analysis
          </p>
        </div>

        <div className="flex gap-2 mb-8">
            <Input
            type="text"
            placeholder="Enter stock symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
            data-testid="input-news-symbol"
          />
          <Button onClick={handleSearch} disabled={loading} data-testid="button-search-news">
            <Newspaper className="h-4 w-4 mr-2" />
            {loading ? "Loading..." : "Search News"}
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}
        
        {news.length > 0 && !loading && (
          <div className="space-y-4">
            {news.map((article) => (
              <Card
                key={article.id}
                className="hover-elevate transition-all"
                data-testid={`card-news-${article.id}`}
              >
                <CardHeader className="gap-2 space-y-0">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={getSentimentColor(article.sentiment)}
                      data-testid={`badge-sentiment-${article.id}`}
                    >
                      {getSentimentIcon(article.sentiment)} {article.sentiment}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{article.source}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(article.url, "_blank")}
                      data-testid={`button-read-${article.id}`}
                    >
                      Read More <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Enter a stock symbol to see related news and sentiment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

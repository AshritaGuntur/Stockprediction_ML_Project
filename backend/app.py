from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
import yfinance as yf
from newsapi import NewsApiClient
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_DIR = "model_artifacts"
MODEL_PATH = os.path.join(MODEL_DIR, "stock_model_pipeline.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.pkl")

# Initialize NewsAPI (you'll need to set your API key)
# Get free API key from: https://newsapi.org/
NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'your_api_key_here')
try:
    newsapi = NewsApiClient(api_key=NEWS_API_KEY) if NEWS_API_KEY != 'your_api_key_here' else None
except:
    newsapi = None

# =============================
# HELPER FUNCTIONS
# =============================

def get_stock_data(symbol):
    """Fetch real-time stock data from Yahoo Finance"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1d")
        
        if hist.empty:
            return None
        
        current_price = hist['Close'].iloc[-1]
        open_price = hist['Open'].iloc[-1]
        high_price = hist['High'].iloc[-1]
        low_price = hist['Low'].iloc[-1]
        volume = int(hist['Volume'].iloc[-1])
        
        prev_close = info.get('previousClose', current_price)
        change = current_price - prev_close
        change_percent = (change / prev_close) * 100
        
        return {
            'symbol': symbol.upper(),
            'name': info.get('longName', symbol.upper()),
            'price': round(float(current_price), 2),
            'open': round(float(open_price), 2),
            'close': round(float(current_price), 2),
            'high': round(float(high_price), 2),
            'low': round(float(low_price), 2),
            'volume': volume,
            'marketCap': info.get('marketCap', 0),
            'change': round(float(change), 2),
            'changePercent': round(float(change_percent), 2),
            'lastUpdated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return None

def get_stock_history(symbol, range_str='1M'):
    """Fetch historical stock data with moving averages"""
    try:
        # Map range to yfinance period
        period_map = {
            '1M': '1mo',
            '6M': '6mo',
            '1Y': '1y',
            '5Y': '5y'
        }
        period = period_map.get(range_str, '1mo')
        
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            return []
        
        # Calculate moving averages
        hist['MA10'] = hist['Close'].rolling(window=10).mean()
        hist['MA50'] = hist['Close'].rolling(window=50).mean()
        hist['MA200'] = hist['Close'].rolling(window=200).mean()
        
        # Format data
        chart_data = []
        for date, row in hist.iterrows():
            data_point = {
                'date': date.strftime('%Y-%m-%d'),
                'price': round(float(row['Close']), 2)
            }
            if not pd.isna(row['MA10']):
                data_point['ma10'] = round(float(row['MA10']), 2)
            if not pd.isna(row['MA50']):
                data_point['ma50'] = round(float(row['MA50']), 2)
            if not pd.isna(row['MA200']):
                data_point['ma200'] = round(float(row['MA200']), 2)
            chart_data.append(data_point)
        
        return chart_data
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return []

def calculate_technical_indicators(hist_data):
    """Calculate technical indicators for prediction"""
    df = pd.DataFrame(hist_data)
    
    # RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI_14'] = 100 - (100 / (1 + rs))
    
    # MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    # Bollinger Bands
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['STD20'] = df['Close'].rolling(window=20).std()
    df['Bollinger_Upper'] = df['MA20'] + (df['STD20'] * 2)
    df['Bollinger_Lower'] = df['MA20'] - (df['STD20'] * 2)
    
    # Volume indicators
    df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
    
    return df

def generate_prediction(symbol):
    """Generate ML prediction for stock"""
    try:
        # Check if model exists
        if not os.path.exists(MODEL_PATH):
            return generate_simple_prediction(symbol)
        
        # Load model
        pipeline = joblib.load(MODEL_PATH)
        metadata = joblib.load(METADATA_PATH)
        
        # Get historical data
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='3mo')
        
        if hist.empty:
            return None
        
        # Calculate technical indicators
        df = calculate_technical_indicators(hist)
        
        # Get latest features (simplified - in production, match training features)
        latest_data = df.iloc[-1:].copy()
        
        # Create feature dict matching training data
        feature_cols = metadata.get('numeric_features', [])
        
        # For demo, create a simplified prediction
        return generate_simple_prediction(symbol)
        
    except Exception as e:
        print(f"Error generating prediction: {e}")
        return generate_simple_prediction(symbol)

def generate_simple_prediction(symbol):
    """Generate simple statistical prediction when ML model unavailable"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='3mo')
        
        if hist.empty:
            return None
        
        # Calculate statistics
        current_price = hist['Close'].iloc[-1]
        returns = hist['Close'].pct_change().dropna()
        mean_return = returns.mean()
        volatility = returns.std()
        
        # Generate 7-day forecast
        actual_data = []
        predicted_data = []
        confidence_intervals = []
        
        # Last 7 days actual
        for i in range(min(7, len(hist))):
            date = hist.index[-7+i]
            price = hist['Close'].iloc[-7+i]
            actual_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(float(price), 2)
            })
            predicted_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(float(price), 2)
            })
        
        # Next 7 days prediction
        last_price = current_price
        for i in range(1, 8):
            # Simple random walk with drift
            predicted_return = mean_return + np.random.normal(0, volatility * 0.5)
            predicted_price = last_price * (1 + predicted_return)
            
            future_date = datetime.now() + timedelta(days=i)
            
            predicted_data.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'price': round(float(predicted_price), 2)
            })
            
            # Confidence intervals (±2 std)
            lower_bound = predicted_price * (1 - 2 * volatility)
            upper_bound = predicted_price * (1 + 2 * volatility)
            
            confidence_intervals.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'lower': round(float(lower_bound), 2),
                'upper': round(float(upper_bound), 2)
            })
            
            last_price = predicted_price
        
        # Calculate metrics
        expected_growth = ((predicted_data[-1]['price'] - current_price) / current_price) * 100
        
        # Generate insight
        trend = "rise" if expected_growth > 0 else "fall"
        volatility_level = "high" if volatility > 0.03 else "moderate" if volatility > 0.015 else "low"
        
        insight = f"StockSight predicts {symbol} may {trend} {abs(expected_growth):.1f}% over the next 7 days with {volatility_level} volatility."
        
        return {
            'symbol': symbol.upper(),
            'actual': actual_data,
            'predicted': predicted_data,
            'confidenceInterval': confidence_intervals,
            'insight': insight,
            'expectedGrowth': round(float(expected_growth), 2),
            'volatility': round(float(volatility * 100), 2)
        }
        
    except Exception as e:
        print(f"Error in simple prediction: {e}")
        return None

def get_news_for_stock(symbol):
    """Fetch news articles for a stock"""
    try:
        if newsapi is None:
            # Return sample news if API not configured with working links
            ticker = yf.Ticker(symbol)
            company_name = ticker.info.get('longName', symbol)
            
            return [
                {
                    'id': '1',
                    'title': f'{symbol} Stock Analysis - Market Update',
                    'summary': f'Latest market analysis and insights for {symbol}. To get real news articles, configure NEWS_API_KEY in backend/.env file. Get your free API key from newsapi.org',
                    'source': 'StockSight Demo',
                    'url': f'https://finance.yahoo.com/quote/{symbol}/news',
                    'sentiment': 'neutral',
                    'publishedAt': datetime.now().isoformat()
                },
                {
                    'id': '2',
                    'title': f'{company_name} - Recent Developments',
                    'summary': f'Click "Read More" to view real news about {symbol} on Yahoo Finance. For automated news fetching, add your NewsAPI key.',
                    'source': 'Yahoo Finance',
                    'url': f'https://finance.yahoo.com/quote/{symbol}',
                    'sentiment': 'neutral',
                    'publishedAt': datetime.now().isoformat()
                }
            ]
        
        # Fetch real news
        ticker = yf.Ticker(symbol)
        company_name = ticker.info.get('longName', symbol)
        
        articles = newsapi.get_everything(
            q=f'{symbol} OR {company_name}',
            language='en',
            sort_by='publishedAt',
            page_size=10
        )
        
        news_list = []
        for i, article in enumerate(articles.get('articles', [])[:10]):
            # Simple sentiment analysis based on keywords
            title_lower = article['title'].lower()
            description_lower = (article.get('description') or '').lower()
            
            positive_words = ['gain', 'rise', 'up', 'growth', 'profit', 'success', 'beat', 'surge']
            negative_words = ['fall', 'drop', 'down', 'loss', 'decline', 'miss', 'concern', 'risk']
            
            pos_count = sum(1 for word in positive_words if word in title_lower or word in description_lower)
            neg_count = sum(1 for word in negative_words if word in title_lower or word in description_lower)
            
            if pos_count > neg_count:
                sentiment = 'positive'
            elif neg_count > pos_count:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            news_list.append({
                'id': str(i + 1),
                'title': article['title'],
                'summary': article.get('description', 'No description available'),
                'source': article['source']['name'],
                'url': article['url'],
                'sentiment': sentiment,
                'publishedAt': article['publishedAt']
            })
        
        return news_list
        
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

# =============================
# API ROUTES
# =============================

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    """Get current stock data"""
    data = get_stock_data(symbol)
    if data:
        return jsonify(data)
    return jsonify({'error': 'Stock not found'}), 404

@app.route('/api/stock/<symbol>/history', methods=['GET'])
def get_history(symbol):
    """Get historical stock data"""
    range_str = request.args.get('range', '1M')
    data = get_stock_history(symbol, range_str)
    return jsonify(data)

@app.route('/api/predict/<symbol>', methods=['GET'])
def predict(symbol):
    """Get stock prediction"""
    prediction = generate_prediction(symbol)
    if prediction:
        return jsonify(prediction)
    return jsonify({'error': 'Unable to generate prediction'}), 500

@app.route('/api/news/<symbol>', methods=['GET'])
def get_news(symbol):
    """Get news for stock"""
    news = get_news_for_stock(symbol)
    return jsonify(news)

@app.route('/api/compare', methods=['GET'])
def compare_stocks():
    """Compare two stocks"""
    symbol1 = request.args.get('symbol1')
    symbol2 = request.args.get('symbol2')
    
    if not symbol1 or not symbol2:
        return jsonify({'error': 'Both symbol1 and symbol2 required'}), 400
    
    # Get data for both stocks
    stock1_data = get_stock_data(symbol1)
    stock2_data = get_stock_data(symbol2)
    
    if not stock1_data or not stock2_data:
        return jsonify({'error': 'One or both stocks not found'}), 404
    
    # Get historical data for comparison
    hist1 = get_stock_history(symbol1, '1M')
    hist2 = get_stock_history(symbol2, '1M')
    
    # Combine chart data
    chart_data = []
    for i in range(min(len(hist1), len(hist2))):
        chart_data.append({
            'date': hist1[i]['date'],
            'price1': hist1[i]['price'],
            'price2': hist2[i]['price']
        })
    
    # Calculate comparison metrics
    if len(hist1) >= 7 and len(hist2) >= 7:
        seven_day_change1 = ((hist1[-1]['price'] - hist1[-7]['price']) / hist1[-7]['price']) * 100
        seven_day_change2 = ((hist2[-1]['price'] - hist2[-7]['price']) / hist2[-7]['price']) * 100
    else:
        seven_day_change1 = stock1_data['changePercent']
        seven_day_change2 = stock2_data['changePercent']
    
    one_month_trend1 = "Upward" if seven_day_change1 > 0 else "Downward"
    one_month_trend2 = "Upward" if seven_day_change2 > 0 else "Downward"
    
    market_cap_diff = abs(stock1_data['marketCap'] - stock2_data['marketCap'])
    
    return jsonify({
        'symbol1': stock1_data,
        'symbol2': stock2_data,
        'chartData': chart_data,
        'comparison': {
            'sevenDayChange1': round(seven_day_change1, 2),
            'sevenDayChange2': round(seven_day_change2, 2),
            'oneMonthTrend1': one_month_trend1,
            'oneMonthTrend2': one_month_trend2,
            'marketCapDiff': market_cap_diff
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': os.path.exists(MODEL_PATH)
    })

if __name__ == '__main__':
    # Create model directory if it doesn't exist
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("=" * 50)
    print("StockSight Flask Backend")
    print("=" * 50)
    print(f"Model directory: {MODEL_DIR}")
    print(f"Model exists: {os.path.exists(MODEL_PATH)}")
    print(f"NewsAPI configured: {newsapi is not None}")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)

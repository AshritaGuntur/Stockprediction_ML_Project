# StockSight Flask Backend

This is the Flask backend API for the StockSight stock prediction application.

## Features

- Real-time stock data from Yahoo Finance
- Historical stock data with moving averages (MA10, MA50, MA200)
- AI-powered stock predictions (7-day forecast)
- News sentiment analysis
- Stock comparison functionality

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
NEWS_API_KEY=your_newsapi_key_here
```

Get a free API key from [NewsAPI.org](https://newsapi.org/) for real news data. If not configured, the app will return sample news.

### 3. Run the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## API Endpoints

### Stock Data
- `GET /api/stock/<symbol>` - Get current stock data
- `GET /api/stock/<symbol>/history?range=<1M|6M|1Y|5Y>` - Get historical data

### Predictions
- `GET /api/predict/<symbol>` - Get 7-day stock prediction

### News
- `GET /api/news/<symbol>` - Get news articles with sentiment analysis

### Comparison
- `GET /api/compare?symbol1=<SYMBOL1>&symbol2=<SYMBOL2>` - Compare two stocks

### Health Check
- `GET /api/health` - Check backend status

## Tech Stack

- **Flask** - Web framework
- **yfinance** - Stock data provider
- **pandas & numpy** - Data processing
- **scikit-learn** - ML capabilities
- **NewsAPI** - News data (optional)

## Notes

- Stock data is fetched in real-time from Yahoo Finance
- Predictions use statistical methods (can be enhanced with trained ML models)
- All responses are in JSON format
- CORS is enabled for frontend integration

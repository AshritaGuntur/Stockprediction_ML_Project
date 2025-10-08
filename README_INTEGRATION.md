# StockSight - Flask Backend Integration Guide

This project has been updated to use a **Flask backend** instead of mock data. All frontend pages now fetch real stock data dynamically from the backend API.

## Project Structure

```
StockForecastUI/
├── backend/              # Flask backend
│   ├── app.py           # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── client/              # React frontend
│   └── src/
│       ├── pages/       # All pages updated to use real API
│       └── lib/
│           └── api.ts   # API client functions
└── README_INTEGRATION.md # This file
```

## Quick Start

### 1. Start the Flask Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend

In a **new terminal**:

```bash
# From the project root
npm install  # First time only
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## What Changed

### ✅ Removed All Mock Data

All mock data has been removed from:
- `HomePage.tsx` - Now fetches real stock data and charts
- `PredictPage.tsx` - Now gets AI predictions from backend
- `HistoricalPage.tsx` - Now fetches historical data with moving averages
- `NewsPage.tsx` - Now gets real news with sentiment analysis
- `ComparePage.tsx` - Now compares stocks using real data

### ✅ Added Real API Integration

- **API Client** (`client/src/lib/api.ts`) - Centralized API functions
- **Loading States** - All pages show loading spinners
- **Error Handling** - Proper error messages displayed to users
- **Real-time Data** - Stock prices, charts, and news from live sources

### ✅ Backend Features

- **Real Stock Data** - Yahoo Finance integration
- **Historical Charts** - Moving averages (MA10, MA50, MA200)
- **Predictions** - Statistical forecasting (can be enhanced with ML models)
- **News Sentiment** - Keyword-based sentiment analysis
- **Stock Comparison** - Side-by-side analysis

## Environment Variables

### Backend (Optional)

Create `backend/.env`:

```env
NEWS_API_KEY=your_newsapi_key_here
```

### Frontend (Optional)

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stock/<symbol>` | GET | Get current stock data |
| `/api/stock/<symbol>/history` | GET | Get historical data (supports `?range=1M\|6M\|1Y\|5Y`) |
| `/api/predict/<symbol>` | GET | Get 7-day prediction |
| `/api/news/<symbol>` | GET | Get news with sentiment |
| `/api/compare` | GET | Compare stocks (`?symbol1=X&symbol2=Y`) |
| `/api/health` | GET | Health check |

## Testing the Integration

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Open the frontend** in your browser
3. **Try these actions**:
   - Search for a stock (e.g., AAPL, GOOGL, MSFT)
   - View historical data with different time ranges
   - Generate predictions
   - Search for news
   - Compare two stocks

## Troubleshooting

### Backend not connecting?

- Check that Flask is running on port 5000
- Verify CORS is enabled (it is by default)
- Check browser console for errors

### No data showing?

- Verify the stock symbol is valid
- Check backend terminal for errors
- Yahoo Finance may have rate limits

### News not loading?

- NewsAPI key may not be configured (sample news will show)
- Get a free key from https://newsapi.org/

## Production Deployment

### Backend

1. Set environment variables
2. Use a production WSGI server (e.g., Gunicorn)
3. Deploy to a cloud platform (Heroku, AWS, etc.)

### Frontend

1. Update `VITE_API_URL` to your production backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder to a static host

## Tech Stack

**Backend:**
- Flask (Python web framework)
- yfinance (Stock data)
- pandas/numpy (Data processing)
- NewsAPI (News data)

**Frontend:**
- React + TypeScript
- TanStack Query (Data fetching)
- Recharts (Charts)
- Tailwind CSS (Styling)

## Next Steps

- Add user authentication
- Implement ML model training
- Add more technical indicators
- Create watchlists
- Add real-time WebSocket updates
- Implement caching for better performance

## Support

For issues or questions, check:
- Backend logs in the Flask terminal
- Frontend console in browser DevTools
- Network tab to see API requests/responses

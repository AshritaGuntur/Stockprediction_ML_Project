# StockSight - AI-Powered Stock Market Analysis Platform

<div align="center">

[![Flask](https://img.shields.io/badge/Backend-Flask-3.0+-black.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React-18.3+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-5.6+-3178c6.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-13+-336791.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**🤖 Real-time stock analysis powered by Machine Learning**

[📖 Features](#-features) • [🚀 Quick Start](#-quick-start) • [📚 API](#-api-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Overview

**StockSight** is a comprehensive, full-stack web application that leverages **machine learning** and **real-time data** to provide intelligent stock market analysis, predictions, and insights. Built with modern technologies, it offers a seamless user experience for stock market enthusiasts, traders, and analysts.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
  <img src="https://img.shields.io/badge/Last%20Updated-2024-informational" alt="Last Updated">
  <img src="https://img.shields.io/badge/Maintained-Yes-green" alt="Maintained">
</p>

### ✨ Key Features

🔄 **Real-time Stock Data** - Live stock prices and market information from Yahoo Finance
📊 **Historical Analysis** - Interactive charts with technical indicators (RSI, MACD, Bollinger Bands)
🤖 **AI Predictions** - ML-powered 7-day stock price forecasting with confidence intervals
📰 **News Integration** - Real-time financial news with automated sentiment analysis
⚖️ **Stock Comparison** - Side-by-side analysis with trend visualization
💾 **Model Management** - Save, load, and manage trained ML prediction models
🎨 **Modern UI** - Beautiful, responsive interface built with React & Tailwind CSS

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Flask Backend  │◄──►│   Data Sources  │
│   (Frontend)    │    │   (Python API)  │    │   (External)    │
│                 │    │                 │    │                 │
│ - TypeScript    │    │ - Flask         │    │ - Yahoo Finance │
│ - React Query   │    │ - ML Models     │    │ - NewsAPI       │
│ - Recharts      │    │ - PostgreSQL    │    │ - Real-time DB  │
│ - Tailwind CSS  │    │ - REST API      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

<details>
<summary><strong>🛠️ Tech Stack Details</strong></summary>

### Backend (Python/Flask)
- **Framework**: Flask 3.0+
- **ML Libraries**: scikit-learn, pandas, numpy, joblib
- **Data Sources**: yfinance, NewsAPI
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Gunicorn, Docker support

### Frontend (React/TypeScript)
- **Framework**: React 18.3+ with TypeScript
- **UI Library**: Radix UI components
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with animations
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite for fast development

</details>

## 🌟 Overview

**StockSight** is a comprehensive, full-stack web application that leverages machine learning and real-time data to provide intelligent stock market analysis, predictions, and insights. Built with modern technologies, it offers a seamless user experience for stock market enthusiasts, traders, and analysts.

### ✨ Key Features

- 🔄 **Real-time Stock Data** - Live stock prices and market information
- 📊 **Historical Analysis** - Interactive charts with technical indicators (RSI, MACD, Bollinger Bands)
- 🤖 **AI Predictions** - ML-powered 7-day stock price forecasting
- 📰 **News Integration** - Real-time financial news with sentiment analysis
- ⚖️ **Stock Comparison** - Side-by-side analysis of multiple stocks
- 💾 **Model Management** - Save, load, and manage ML prediction models
- 🎨 **Modern UI** - Beautiful, responsive interface built with React & Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Flask Backend  │◄──►│   Data Sources  │
│   (Frontend)    │    │   (Python API)  │    │   (External)    │
│                 │    │                 │    │                 │
│ - TypeScript    │    │ - Flask         │    │ - Yahoo Finance │
│ - React Query   │    │ - ML Models     │    │ - NewsAPI       │
│ - Recharts      │    │ - PostgreSQL    │    │ - Real-time DB  │
│ - Tailwind CSS  │    │ - REST API      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 📋 Prerequisites

- **Python 3.8+** for the Flask backend
- **Node.js 16+** for the React frontend
- **PostgreSQL** database (or Neon DB)
- **Git** for version control

### Backend Setup (Flask)

```bash
# Navigate to backend directory
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your API keys

# Run Flask development server
python app.py
```

**🚀 Backend runs on:** `http://localhost:5001`

### Frontend Setup (React)

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

**🚀 Frontend runs on:** `http://localhost:5173`

> **Note**: Both servers need to run simultaneously for full functionality.

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`.env`)
```env
# News API (optional - get from https://newsapi.org/)
NEWS_API_KEY=your_newsapi_key_here

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/stocksight
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

<details>
<summary><strong>🔑 API Keys Setup Guide</strong></summary>

1. **NewsAPI** (Optional):
   - Visit [newsapi.org](https://newsapi.org/)
   - Sign up for a free account
   - Copy your API key to `backend/.env`

2. **Database**:
   - Use local PostgreSQL or [Neon DB](https://neon.tech/)
   - Update `DATABASE_URL` in `backend/.env`

</details>

---

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stock/<symbol>` | GET | Get current stock data and metrics |
| `/api/stock/<symbol>/history` | GET | Historical data with technical indicators |
| `/api/predict/<symbol>` | GET | 7-day ML price predictions |
| `/api/news/<symbol>` | GET | Financial news with sentiment analysis |
| `/api/compare` | GET | Compare two stocks side-by-side |
| `/api/models/save` | POST | Save trained ML models to database |
| `/api/models/list` | GET | List all saved models |
| `/api/health` | GET | System health check |

### Example API Usage

```javascript
// Get stock data
const response = await fetch('/api/stock/AAPL');
const stockData = await response.json();

// Get predictions
const prediction = await fetch('/api/predict/GOOGL');
const forecast = await prediction.json();

// Compare stocks
const comparison = await fetch('/api/compare?symbol1=AAPL&symbol2=MSFT');
const analysis = await comparison.json();
```

## 🤖 Machine Learning Features

### Prediction Models

- **Statistical Models**: Time-series analysis using historical patterns
- **ML Models**: Scikit-learn based predictive algorithms
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Model Storage**: Save and load trained models via REST API

### Supported Algorithms

- Linear Regression
- Random Forest
- Gradient Boosting
- LSTM Networks (extensible)
- Ensemble Methods

## 🗄️ Database Schema

```sql
-- Core tables (managed by Drizzle ORM)
users (id, email, created_at)
models (id, name, type, version, created_at)
predictions (id, symbol, prediction_data, created_at)
```

## 🎨 Frontend Features

### UI Components

- **Interactive Charts**: Historical data visualization with Recharts
- **Real-time Updates**: Live stock price updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching capability
- **Loading States**: Skeleton loaders and progress indicators

### Pages

- **Dashboard**: Overview of watched stocks and market trends
- **Stock Details**: Comprehensive analysis of individual stocks
- **Predictions**: AI-powered forecasting with confidence intervals
- **Historical Data**: Interactive charts with technical indicators
- **News Feed**: Financial news with sentiment analysis
- **Compare**: Side-by-side stock comparison tool

## 🔒 Security & Best Practices

- **CORS Configuration**: Properly configured cross-origin requests
- **Input Validation**: Sanitized user inputs and API parameters
- **Error Handling**: Comprehensive error boundaries and user feedback
- **API Rate Limiting**: Protection against excessive requests
- **Environment Variables**: Secure configuration management

## 🧪 Testing

```bash
# Backend tests (Python)
cd backend/
python -m pytest

# Frontend tests (React)
npm run test

# Integration tests
npm run test:e2e
```

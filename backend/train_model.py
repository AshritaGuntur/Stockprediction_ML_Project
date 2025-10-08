import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, TimeSeriesSplit, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


# =============================
# CONFIG
# =============================
DATA_PATH = "stock_prediction_dataset_2000.xlsx"
MODEL_DIR = "model_artifacts"
TARGET_COL = "Target_Close_7d"  # The target column to predict
os.makedirs(MODEL_DIR, exist_ok=True)


# =============================
# HELPER FUNCTIONS
# =============================
def create_features(df):
    """Create additional predictive features"""
    df = df.copy()

    # Technical indicator interactions
    if 'RSI_14' in df.columns and 'MACD' in df.columns:
        df['RSI_MACD_Interaction'] = df['RSI_14'] * df['MACD']

    # Bollinger Band width
    if 'Bollinger_Upper' in df.columns and 'Bollinger_Lower' in df.columns:
        df['Bollinger_Width'] = df['Bollinger_Upper'] - df['Bollinger_Lower']
        df['Bollinger_Position'] = (df['Bollinger_Upper'] + df['Bollinger_Lower']) / 2

    # Sentiment features
    if 'News_Sentiment_Score' in df.columns and 'Social_Sentiment_Score' in df.columns:
        df['Combined_Sentiment'] = (df['News_Sentiment_Score'] + df['Social_Sentiment_Score']) / 2
        df['Sentiment_Divergence'] = abs(df['News_Sentiment_Score'] - df['Social_Sentiment_Score'])

    # Financial health score
    if 'ROE' in df.columns and 'Debt_to_Equity' in df.columns:
        df['Financial_Health'] = df['ROE'] / (1 + df['Debt_to_Equity'])

    # Valuation metrics
    if 'PE_Ratio' in df.columns and 'EPS' in df.columns:
        df['Earnings_Yield'] = df['EPS'] / df['PE_Ratio']

    # Macro indicators
    if 'Inflation_Rate' in df.columns and 'Interest_Rate' in df.columns:
        df['Real_Interest_Rate'] = df['Interest_Rate'] - df['Inflation_Rate']

    return df


def validate_input_data(df):
    """Ensure input data quality"""
    issues = []

    # Check for missing values
    missing_pct = df.isnull().sum() / len(df) * 100
    high_missing = missing_pct[missing_pct > 50]
    if len(high_missing) > 0:
        issues.append(f"High missing values in: {high_missing.index.tolist()}")

    # Check for outliers
    for col in df.select_dtypes(include=[np.number]).columns:
        if df[col].std() > 0:
            z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
            outlier_pct = (z_scores > 5).sum() / len(df) * 100
            if outlier_pct > 5:
                issues.append(f"High outliers in {col}: {outlier_pct:.1f}%")

    if issues:
        print("⚠️ Data quality issues detected:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    return True


def check_prediction_drift(new_predictions, historical_mean, historical_std, threshold=2):
    """Alert if predictions drift significantly"""
    new_mean = np.mean(new_predictions)
    z_score = abs(new_mean - historical_mean) / historical_std

    if z_score > threshold:
        print(f"⚠️ WARNING: Prediction drift detected! Z-score: {z_score:.2f}")
        return True
    return False


# =============================
# LOAD DATA
# =============================
print("📂 Loading data...")
try:
    df = pd.read_excel(DATA_PATH)
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
except Exception as e:
    print(f"⚠️ Could not load dataset: {e}")
    print("📝 Creating sample dataset for demonstration...")

    # Create sample dataset
    np.random.seed(42)
    dates = pd.date_range('2020-01-01', '2023-12-31', freq='D')

    df = pd.DataFrame({
        'Date': dates,
        'Close': np.random.randn(len(dates)).cumsum() * 10 + 100,
        'Volume': np.random.randint(1000000, 10000000, len(dates)),
        'RSI_14': np.random.uniform(20, 80, len(dates)),
        'MACD': np.random.randn(len(dates)) * 2,
        'Bollinger_Upper': np.random.randn(len(dates)).cumsum() * 5 + 110,
        'Bollinger_Lower': np.random.randn(len(dates)).cumsum() * 5 + 90,
        'News_Sentiment_Score': np.random.uniform(-1, 1, len(dates)),
        'Social_Sentiment_Score': np.random.uniform(-1, 1, len(dates)),
        'ROE': np.random.uniform(0.05, 0.25, len(dates)),
        'Debt_to_Equity': np.random.uniform(0.1, 2.0, len(dates)),
        'PE_Ratio': np.random.uniform(10, 30, len(dates)),
        'EPS': np.random.uniform(1, 5, len(dates)),
        'Inflation_Rate': np.random.uniform(0.01, 0.08, len(dates)),
        'Interest_Rate': np.random.uniform(0.02, 0.06, len(dates))
    })

    # Create target variable (next day close price)
    df['Target_Close_7d'] = df['Close'].shift(-7)
    df = df.dropna()

    print(f"✅ Created sample dataset with {len(df)} rows, {len(df.columns)} columns")


# Display available columns
print(f"\n📋 Available columns:")
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. {col}")


# Auto-detect target column if TARGET_COL doesn't exist
if TARGET_COL not in df.columns:
    print(f"\n⚠️ '{TARGET_COL}' not found. Looking for target column...")

    # Look for common target column patterns
    target_candidates = [col for col in df.columns if any(x in col.lower() for x in ['target', 'label', 'return', 'price_7d', 'future'])]

    if target_candidates:
        TARGET_COL = target_candidates[0]
        print(f"✅ Using '{TARGET_COL}' as target column")
    else:
        print("\n❌ Could not auto-detect target column. Please specify manually:")
        print("Set TARGET_COL to one of the columns listed above")
        raise ValueError(f"Target column '{TARGET_COL}' not found in dataset")


# Validate data quality
print("\n🔍 Validating data quality...")
validate_input_data(df)


# Drop rows with missing target
print(f"\n🎯 Target column: '{TARGET_COL}'")
print(f"Missing values in target: {df[TARGET_COL].isnull().sum()} ({df[TARGET_COL].isnull().sum()/len(df)*100:.1f}%)")
df = df.dropna(subset=[TARGET_COL])
print(f"✅ {len(df)} rows after dropping missing targets")


# =============================
# FEATURE ENGINEERING
# =============================
print("\n🔧 Creating features...")
initial_rows = len(df)
df = create_features(df)
df = df.dropna()  # Drop rows with NaN from feature engineering
print(f"✅ {len(df)} rows after feature engineering (dropped {initial_rows - len(df)} rows with NaN)")


# =============================
# SPLIT FEATURES & TARGET
# =============================
# Exclude columns that shouldn't be features
exclude_cols = [TARGET_COL, 'Confidence_Interval_Lower', 'Confidence_Interval_Upper',
                'Last_Updated', 'Missing_Values_Flag']
feature_cols = [col for col in df.columns if col not in exclude_cols]


X = df[feature_cols]
y = df[TARGET_COL]


# Identify column types
categorical_cols = X.select_dtypes(include=["object"]).columns.tolist()
numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()


print(f"\n📊 Features: {len(numeric_cols)} numeric, {len(categorical_cols)} categorical")
print(f"   Categorical: {categorical_cols}")


# =============================
# PREPROCESSING
# =============================
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
    ]
)


# =============================
# MODEL PIPELINE
# =============================
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)


pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])


# =============================
# TRAIN-TEST SPLIT
# =============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, shuffle=False
)


print(f"\n📈 Train size: {len(X_train)}, Test size: {len(X_test)}")


# =============================
# TIME-SERIES CROSS-VALIDATION
# =============================
print("\n🔄 Performing time-series cross-validation...")
tscv = TimeSeriesSplit(n_splits=5)
cv_scores = []


for fold, (train_idx, val_idx) in enumerate(tscv.split(X_train), 1):
    X_train_cv = X_train.iloc[train_idx]
    X_val_cv = X_train.iloc[val_idx]
    y_train_cv = y_train.iloc[train_idx]
    y_val_cv = y_train.iloc[val_idx]

    pipeline.fit(X_train_cv, y_train_cv)
    y_pred_cv = pipeline.predict(X_val_cv)
    score = r2_score(y_val_cv, y_pred_cv)
    cv_scores.append(score)
    print(f"  Fold {fold}: R² = {score:.3f}")


print(f"📊 Mean CV R²: {np.mean(cv_scores):.3f} (+/- {np.std(cv_scores):.3f})")


# =============================
# TRAIN FINAL MODEL
# =============================
print("\n🚀 Training final model on full training set...")
pipeline.fit(X_train, y_train)
print("✅ Model trained successfully")


# =============================
# EVALUATION
# =============================
print("\n📊 Evaluating on test set...")
y_pred = pipeline.predict(X_test)


mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)


print(f"  MAE:  {mae:.3f}")
print(f"  RMSE: {rmse:.3f}")
print(f"  R²:   {r2:.3f}")


# Error analysis
errors = y_test - y_pred
error_pct = (errors / y_test) * 100


print(f"\n📉 Error Analysis:")
print(f"  Mean Error: {np.mean(errors):.3f}")
print(f"  Median Error: {np.median(errors):.3f}")
print(f"  Mean Absolute % Error: {np.mean(np.abs(error_pct)):.2f}%")
print(f"  Predictions within ±5%: {(np.abs(error_pct) <= 5).sum() / len(error_pct) * 100:.1f}%")
print(f"  Predictions within ±10%: {(np.abs(error_pct) <= 10).sum() / len(error_pct) * 100:.1f}%")


# =============================
# FEATURE IMPORTANCE
# =============================
print("\n🔍 Analyzing feature importance...")
if len(categorical_cols) > 0:
    cat_features = pipeline.named_steps['preprocessor'].named_transformers_['cat'].get_feature_names_out(categorical_cols)
    feature_names = numeric_cols + list(cat_features)
else:
    feature_names = numeric_cols


importances = pipeline.named_steps['model'].feature_importances_
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values('importance', ascending=False).head(20)


print("\nTop 20 Most Important Features:")
print(importance_df.to_string(index=False))


# Save feature importance
importance_df.to_csv(os.path.join(MODEL_DIR, "feature_importance.csv"), index=False)


# =============================
# PREDICTION INTERVALS
# =============================
print("\n📐 Computing prediction intervals...")
X_test_transformed = pipeline.named_steps["preprocessor"].transform(X_test)
forest = pipeline.named_steps["model"]
all_preds = np.stack([tree.predict(X_test_transformed) for tree in forest.estimators_], axis=1)


lower_5 = np.percentile(all_preds, 5, axis=1)
upper_95 = np.percentile(all_preds, 95, axis=1)
lower_10 = np.percentile(all_preds, 10, axis=1)
upper_90 = np.percentile(all_preds, 90, axis=1)


# Check coverage
coverage_90 = ((y_test >= lower_10) & (y_test <= upper_90)).sum() / len(y_test) * 100
coverage_80 = ((y_test >= lower_5) & (y_test <= upper_95)).sum() / len(y_test) * 100


print(f"  90% Interval Coverage: {coverage_90:.1f}%")
print(f"  80% Interval Coverage: {coverage_80:.1f}%")


# =============================
# SAVE RESULTS
# =============================
print("\n💾 Saving results...")
results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred,
    "Error": errors,
    "Error_Pct": error_pct,
    "Pred_Lower_5pct": lower_5,
    "Pred_Upper_95pct": upper_95,
    "Pred_Lower_10pct": lower_10,
    "Pred_Upper_90pct": upper_90
})
results.to_csv(os.path.join(MODEL_DIR, "test_results.csv"), index=False)


# Save full pipeline
model_path = os.path.join(MODEL_DIR, "stock_model_pipeline.pkl")
joblib.dump(pipeline, model_path)


# Save metadata
metadata = {
    "trained_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "model_path": model_path,
    "target_column": TARGET_COL,
    "mae": mae,
    "rmse": rmse,
    "r2": r2,
    "cv_scores": cv_scores,
    "mean_cv_r2": np.mean(cv_scores),
    "numeric_features": numeric_cols,
    "categorical_features": categorical_cols,
    "n_train": len(X_train),
    "n_test": len(X_test),
    "prediction_mean": float(np.mean(y_pred)),
    "prediction_std": float(np.std(y_pred))
}
joblib.dump(metadata, os.path.join(MODEL_DIR, "metadata.pkl"))


print(f"✅ All artifacts saved in '{MODEL_DIR}/'")


# =============================
# PREDICTION FUNCTIONS
# =============================
def predict_stock_with_intervals(input_df, confidence=90):
    """
    Predict with confidence intervals

    Args:
        input_df: DataFrame with same features as training data
        confidence: Confidence level (e.g., 90 for 90% interval)

    Returns:
        DataFrame with predictions and intervals
    """
    pipeline = joblib.load(os.path.join(MODEL_DIR, "stock_model_pipeline.pkl"))

    # Point prediction
    preds = pipeline.predict(input_df)

    # Get all tree predictions for intervals
    X_transformed = pipeline.named_steps["preprocessor"].transform(input_df)
    forest = pipeline.named_steps["model"]
    all_preds = np.stack([tree.predict(X_transformed) for tree in forest.estimators_], axis=1)

    lower_pct = (100 - confidence) / 2
    upper_pct = 100 - lower_pct

    lower_bound = np.percentile(all_preds, lower_pct, axis=1)
    upper_bound = np.percentile(all_preds, upper_pct, axis=1)

    return pd.DataFrame({
        'prediction': preds,
        f'lower_{confidence}': lower_bound,
        f'upper_{confidence}': upper_bound,
        'uncertainty': upper_bound - lower_bound
    })


def predict_stock_simple(input_df):
    """
    Simple prediction function for quick use

    Args:
        input_df: DataFrame with same features as training data

    Returns:
        Array of predictions
    """
    pipeline = joblib.load(os.path.join(MODEL_DIR, "stock_model_pipeline.pkl"))
    return pipeline.predict(input_df)


def predict_with_monitoring(input_df):
    """
    Prediction with drift monitoring

    Args:
        input_df: DataFrame with same features as training data

    Returns:
        Predictions and drift warning flag
    """
    pipeline = joblib.load(os.path.join(MODEL_DIR, "stock_model_pipeline.pkl"))
    metadata = joblib.load(os.path.join(MODEL_DIR, "metadata.pkl"))

    preds = pipeline.predict(input_df)

    # Check for drift
    drift_detected = check_prediction_drift(
        preds,
        metadata['prediction_mean'],
        metadata['prediction_std']
    )

    return preds, drift_detected


# =============================
# EXAMPLE USAGE
# =============================
print("\n" + "="*50)
print("EXAMPLE USAGE")
print("="*50)


# Example 1: Simple prediction
print("\n1️⃣ Simple Prediction:")
sample_data = X_test.head(3)
simple_preds = predict_stock_simple(sample_data)
print(f"Predictions: {simple_preds}")


# Example 2: Prediction with intervals
print("\n2️⃣ Prediction with Confidence Intervals:")
interval_preds = predict_stock_with_intervals(sample_data, confidence=90)
print(interval_preds)


# Example 3: Prediction with monitoring
print("\n3️⃣ Prediction with Drift Monitoring:")
monitored_preds, drift_flag = predict_with_monitoring(sample_data)
print(f"Predictions: {monitored_preds}")
print(f"Drift detected: {drift_flag}")


print("\n✅ Pipeline complete! Model ready for production use.")
print(f"📁 All files saved in: {MODEL_DIR}/")
print("\nSaved files:")
print("  - stock_model_pipeline.pkl (trained model)")
print("  - metadata.pkl (model metadata)")
print("  - test_results.csv (predictions on test set)")
print("  - feature_importance.csv (feature importance scores)")

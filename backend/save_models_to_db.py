#!/usr/bin/env python3
"""
Script to save existing .pkl model files to PostgreSQL database
"""

import os
import sys
from database import save_model_to_db

def save_existing_models_to_db():
    """Save existing model files to database"""

    # Model files to save
    model_files = [
        {
            'path': 'model_artifacts/stock_model_pipeline.pkl',
            'type': 'stock_prediction',
            'name': 'Stock Prediction Model v1.0',
            'version': '1.0.0',
            'description': 'RandomForest model for stock price prediction'
        }
    ]

    print("💾 Saving model files to database...")

    for model_info in model_files:
        model_path = model_info['path']

        if not os.path.exists(model_path):
            print(f"⚠️ Model file not found: {model_path}")
            continue

        try:
            print(f"📁 Processing: {model_path}")

            # Save to database
            model_id = save_model_to_db(
                model_path,
                model_type=model_info['type'],
                name=model_info['name'],
                version=model_info['version'],
                description=model_info['description']
            )

            print(f"✅ Saved model to database with ID: {model_id}")

        except Exception as e:
            print(f"❌ Error saving {model_path}: {e}")

    print("🎉 Model migration completed!")

if __name__ == "__main__":
    save_existing_models_to_db()

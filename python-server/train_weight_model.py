"""
Train a global XGBoost model to determine the optimal weights for risk components.
Analyzes how each component (depression, anxiety, etc.) contributes to the overall risk.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler

DATA_DIR = Path("data/training_data")
MODEL_DIR = Path("models/weight_models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_weight_model():
    print("=" * 80)
    print("TRAINING GLOBAL RISK WEIGHT MODEL")
    print("=" * 80)
    
    # 1. Load data
    risk_file = DATA_DIR / "risk_timeseries.csv"
    if not risk_file.exists():
        print(f"ERROR: {risk_file} not found. Run generate_training_data.py first.")
        return
        
    df = pd.read_csv(risk_file)
    print(f"✓ Loaded {len(df)} records")
    
    # 2. Define features and target
    # These match the keys in RISK_WEIGHTS in riskConfig.js
    feature_cols = [
        'depression_quiz_score', 
        'anxiety_quiz_score', 
        'stress_quiz_score', 
        'sleep_quiz_score', 
        'journal_score', 
        'chatbot_score', 
        'quiz_score', 
        'community_score', 
        'disengagement_score'
    ]
    
    X = df[feature_cols]
    y = df['risk_score']
    
    # 3. Train XGBoost
    print(f"✓ Training on features: {feature_cols}")
    model = XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        random_state=42,
        verbosity=0
    )
    
    model.fit(X, y)
    
    # 4. Extract Feature Importance
    importances = model.feature_importances_
    # Normalize importances so they sum to 1.0 (like weights)
    normalized_weights = importances / np.sum(importances)
    
    weight_dict = {feature_cols[i]: round(float(normalized_weights[i]), 3) for i in range(len(feature_cols))}
    
    print("\n[DETERMINED WEIGHTS VIA XGBOOST]")
    print("-" * 40)
    for k, v in weight_dict.items():
        print(f"  {k:25}: {v:.3f}")
    print("-" * 40)
    
    # 5. Save model and metadata
    model_file = MODEL_DIR / "global_weights_xgb.pkl"
    with open(model_file, 'wb') as f:
        pickle.dump({
            'model': model,
            'feature_cols': feature_cols,
            'weights': weight_dict
        }, f)
    
    print(f"\n✓ Weights model saved to {model_file}")

if __name__ == "__main__":
    train_weight_model()

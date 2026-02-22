import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "server", ".env"))
MONGO_URI = os.getenv("MONGO_URI")

def run_soulsync_ai_pipeline():
    """
    End-to-End SoulSync AI Pipeline:
    1. Fetch real patterns from MongoDB
    2. Augment with Gaussian Noise
    3. Train Weight Model (What matters now)
    4. Train Forecast Model (What happens next)
    """

    
    # DATA
    print("\nFetching from MongoDB...")
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database("soulsync")
        collection = db["riskscores"]
        df_raw = pd.DataFrame(list(collection.find({})))
        
        if df_raw.empty:
            print("Database is empty. Using seeds for training baseline.")
            raw_data = pd.DataFrame([{
                'overall_score': 5.0, 
                'depression_quiz_score': 4.0, 
                'anxiety_quiz_score': 3.5, 
                'stress_quiz_score': 4.2, 
                'sleep_quiz_score': 6.0, 
                'disengagement_score': 0.1,
                'journal_score': 0.1,
                'chatbot_score': 0.1,
                'quiz_score': 0.1,
                'community_score': 0.1
            }] * 10)
        else:
            raw_data = df_raw.dropna(subset=['overall_score']).copy()
            if raw_data.empty:
                print("No records with overall_score found. Using seeds.")
                raw_data = pd.DataFrame([{
                    'overall_score': 5, 
                    'depression_quiz_score': 4, 
                    'anxiety_quiz_score': 3, 
                    'stress_quiz_score': 5, 
                    'sleep_quiz_score': 6, 
                    'disengagement_score': 0.1,
                    'journal_score': 0.1,
                    'chatbot_score': 0.1,
                    'quiz_score': 0.1,
                    'community_score': 0.1
                }] * 10)
            else:
                print(f"Success! Fetched {len(raw_data)} valid check-in records.")

        # GAUSSIAN NOISE AUGMENTATION
        print("Injecting Gaussian Noise to expand dataset to 1000 records...")
        augmented = []
        features = [
            'depression_quiz_score', 'anxiety_quiz_score', 'stress_quiz_score', 
            'sleep_quiz_score', 'disengagement_score', 'journal_score', 
            'chatbot_score', 'quiz_score', 'community_score'
        ]
        
        for _ in range(1000):
            source = raw_data.iloc[np.random.randint(0, len(raw_data))]
            noisy = {}
            noise_factor = 0.2
            
            target_val = source.get('overall_score', 5.0)
            if pd.isna(target_val): target_val = 5.0
            noisy['overall_score'] = np.clip(target_val + np.random.normal(0, noise_factor), 0, 10)
        
            for f in features:
                val = source.get(f, 5.0)
                if pd.isna(val): val = 0.1 # Default small value for missing features
                noisy[f] = np.clip(val + np.random.normal(0, noise_factor), 0, 10)
            augmented.append(noisy)
            
        df_train = pd.DataFrame(augmented)
        
        print("\nTraining Weight Model")
        X_w = df_train[features]
        y_w = df_train['overall_score']
        
        weight_model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1)
        weight_model.fit(X_w, y_w)
        
        importances = weight_model.feature_importances_
        normalized_weights = importances / np.sum(importances)
        
        # SAVE WEIGHTS FOR PRODUCTION SERVICES (Python API)
        import pickle
        weight_dir = os.path.join(os.path.dirname(__file__), "models", "weight_models")
        os.makedirs(weight_dir, exist_ok=True)
        weight_path = os.path.join(weight_dir, "global_weights_xgb.pkl")
        
        weight_data = {
            'weights': dict(zip(features, normalized_weights.tolist())),
            'updated_at': datetime.now().isoformat(),
            'model_type': 'xgboost_regressor_importance'
        }
        
        with open(weight_path, 'wb') as f:
            pickle.dump(weight_data, f)
        print(f"Weights saved to: {weight_path}")

        # --- DYNAMIC UPDATE: Overwrite riskConfig.js in Editor ---
        print("Syncing new weights to Node.js riskConfig.js...")
        js_config_path = os.path.join(os.path.dirname(__file__), "..", "server", "config", "riskConfig.js")
        
        if os.path.exists(js_config_path):
            weights_object_str = "export const RISK_WEIGHTS = {\n"
            for f, w in zip(features, normalized_weights):
                weights_object_str += f"  {f}: {w:.4f},\n"
            weights_object_str += "};\n\n"
            
            # Preserve RISK_LABELS while updating weights
            risk_labels_str = """export const RISK_LABELS = [
  { key: "depression_quiz_score", label: "Elevated depression", threshold: 0.72 },
  { key: "anxiety_quiz_score", label: "High anxiety", threshold: 0.60 },
  { key: "stress_quiz_score", label: "Severe stress", threshold: 0.70 },
  { key: "sleep_quiz_score", label: "Poor sleep quality", threshold: 0.60 },
  { key: "journal_score", label: "High distress in journal", threshold: 0.70 },
  { key: "chatbot_score", label: "Concerning chat patterns", threshold: 0.65 }
];
"""
            with open(js_config_path, 'w') as f:
                f.write(weights_object_str + risk_labels_str)
            print(f"Success! riskConfig.js updated in your editor.")
        else:
            print(f"Warning: Could not find riskConfig.js at {js_config_path}")

        print("\n--- AI-DETERMINED RISK WEIGHTS ---")
        for f, w in zip(features, normalized_weights):
            print(f"{f:25}: {w:.4f}")
            
        # --- STAGE 3: PREDICTIVE WELLNESS (FORECASTING) ---
        print("\n[Stage 3] Training Forecasting Model (Temporal Regression)...")
        # Generate temporal training sequences (History -> Future)
        X_f, y_f = [], []
        for _ in range(2000):
            start = np.random.uniform(2, 6)
            trend = np.random.uniform(-0.1, 0.2)
            # Create a 14-day sequence
            seq = [np.clip(start + (i * trend) + np.random.normal(0, 0.1), 0, 10) for i in range(14)]
            X_f.append(seq[:7]) # Past 7 days
            y_f.append(seq[7])  # Next day
            
        forecast_model = XGBRegressor(n_estimators=100, max_depth=5)
        forecast_model.fit(np.array(X_f), np.array(y_f))

        # SAVE FORECAST MODEL FOR PRODUCTION SERVICES
        model_dir = os.path.join(os.path.dirname(__file__), "models", "xgboost_models")
        os.makedirs(model_dir, exist_ok=True)
        # Using a generic name or 'global' for the fallback model
        forecast_path = os.path.join(model_dir, "global_forecast_xgb.pkl")
        with open(forecast_path, 'wb') as f:
            pickle.dump(forecast_model, f)
        print(f"Forecast model saved to: {forecast_path}")
        
        # --- STAGE 4: VISUALIZATION ---
        print("\nGenerating Results Visualization...")
        
        # Plot 1: Weights
        plt.figure(figsize=(12, 5))
        plt.subplot(1, 2, 1)
        plt.barh(features, normalized_weights, color='#8E24AA')
        plt.title("XGBoost Learned Weights")
        plt.xlabel("Importance (Total=1.0)")

        # Plot 2: Forecast Example
        plt.subplot(1, 2, 2)
        sample_history = [3.5, 3.8, 4.2, 4.0, 4.5, 4.8, 5.2]
        sample_preds = []
        window = list(sample_history)
        for _ in range(7):
            p = forecast_model.predict(np.array(window[-7:]).reshape(1, -1))[0]
            sample_preds.append(p)
            window.append(p)
            
        plt.plot(range(-6, 1), sample_history, 'bo-', label="Past (Real)")
        plt.plot(range(1, 8), sample_preds, 'ro--', label="Forecast (AI)")
        plt.axhline(7, color='red', linestyle=':', label="Critical Threshold")
        plt.title("AIPredictive Radar (7-Day Forecast)")
        plt.legend()
        
        print("Visualization complete. Saving charts to pipeline_results.png...")
        plt.tight_layout()
        plt.savefig("pipeline_results.png")
        plt.close()
        
        print("\nPIPELINE RUN COMPLETE. Models trained on live/augmented data.")
        
    except Exception as e:
        print(f"\nPIPELINE ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_soulsync_ai_pipeline()

"""
XGBoost Prediction Service
Loads trained models and provides prediction interface
Replaces ARIMA for risk forecasting
"""

import pickle
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import sys

try:
    from xgboost import XGBRegressor
except ImportError:
    print("ERROR: xgboost not installed. Run: pip install xgboost", file=sys.stderr)

class XGBoostPredictor:
    """Wrapper for XGBoost predictions"""
    
    def __init__(self, model_dir="models/xgboost_models"):
        self.model_dir = Path(model_dir)
        self.models = {}
        self.scalers = {}
        self.feature_cols = None
        self._load_feature_info()
    
    def _load_feature_info(self):
        """Load feature column names from training"""
        self.feature_cols = [
            'lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5', 'lag_6', 'lag_7',
            'rolling_mean_3', 'rolling_mean_7',
            'rolling_std_3', 'rolling_std_7',
            'trend_7',
            'day_of_week'
        ]
    
    def _load_model(self, user_id):
        """Lazy load model and scaler for a user"""
        
        # Convert user_id to integer if it's a string
        if isinstance(user_id, str):
            try:
                if user_id.startswith("user_"):
                    user_id = int(user_id.split("_")[1])
                else:
                    user_id = int(user_id)
            except (ValueError, IndexError):
                # MongoDB ObjectId or non-numeric ID — no stored model
                print(f"Info: user_id '{user_id}' is not numeric, will use input-based prediction", file=sys.stderr)
                return None, None
        
        if user_id in self.models:
            return self.models[user_id], self.scalers[user_id]
        
        try:
            model_file = self.model_dir / f"user_{user_id}_xgb.pkl"
            scaler_file = self.model_dir / f"user_{user_id}_scaler.pkl"
            
            if not model_file.exists():
                print(f"Info: No stored model found for user {user_id}, will use input-based prediction", file=sys.stderr)
                return None, None
            
            with open(model_file, 'rb') as f:
                model = pickle.load(f)
            
            with open(scaler_file, 'rb') as f:
                scaler = pickle.load(f)
            
            self.models[user_id] = model
            self.scalers[user_id] = scaler
            
            return model, scaler
            
        except Exception as e:
            print(f"Error loading model for user {user_id}: {e}", file=sys.stderr)
            return None, None

    def predict_from_input(self, recent_risks: list, days_ahead: int = 7):
        """
        Predict future risk scores directly from recent_risks input.
        Trains a lightweight model on-the-fly — no stored model needed.
        Used as fallback when no stored model exists for the user.

        Args:
            recent_risks: List of recent risk scores (minimum 3 values)
            days_ahead: Number of days to predict

        Returns:
            List of prediction dicts, or None if failed
        """
        try:
            if len(recent_risks) < 3:
                print("predict_from_input: Need at least 3 recent_risks values", file=sys.stderr)
                return None

            risks = np.array(recent_risks, dtype=float)

            # Build training samples from the input window
            X, y = [], []
            for i in range(2, len(risks)):
                window = risks[max(0, i-7):i]
                features = [
                    risks[i-1],                          # lag_1
                    risks[i-2] if i >= 2 else risks[0],  # lag_2
                    risks[i-3] if i >= 3 else risks[0],  # lag_3
                    risks[i-4] if i >= 4 else risks[0],  # lag_4
                    risks[i-5] if i >= 5 else risks[0],  # lag_5
                    risks[i-6] if i >= 6 else risks[0],  # lag_6
                    risks[i-7] if i >= 7 else risks[0],  # lag_7
                    np.mean(risks[max(0, i-3):i]),        # rolling_mean_3
                    np.mean(window),                      # rolling_mean_7
                    np.std(risks[max(0, i-3):i]) if i >= 3 else 0,  # rolling_std_3
                    np.std(window) if len(window) > 1 else 0,        # rolling_std_7
                    self._trend(window),                  # trend_7
                    datetime.now().weekday()              # day_of_week (approx)
                ]
                X.append(features)
                y.append(risks[i])

            X = np.array(X)
            y = np.array(y)

            # Train a quick lightweight XGBoost on this input
            model = XGBRegressor(
                n_estimators=50,
                max_depth=3,
                learning_rate=0.1,
                random_state=42,
                verbosity=0
            )
            model.fit(X, y)

            # Iteratively predict future days
            predictions = []
            current_values = list(risks)

            for day in range(days_ahead):
                window = current_values[-7:] if len(current_values) >= 7 else current_values
                cv = current_values

                features = [
                    cv[-1],
                    cv[-2] if len(cv) >= 2 else cv[0],
                    cv[-3] if len(cv) >= 3 else cv[0],
                    cv[-4] if len(cv) >= 4 else cv[0],
                    cv[-5] if len(cv) >= 5 else cv[0],
                    cv[-6] if len(cv) >= 6 else cv[0],
                    cv[-7] if len(cv) >= 7 else cv[0],
                    np.mean(cv[-3:]),
                    np.mean(window),
                    np.std(cv[-3:]) if len(cv) >= 3 else 0,
                    np.std(window) if len(window) > 1 else 0,
                    self._trend(window),
                    (datetime.now() + timedelta(days=day + 1)).weekday()
                ]

                pred = model.predict(np.array(features).reshape(1, -1))[0]
                pred = float(np.clip(pred, 0, 10))

                future_date = datetime.now() + timedelta(days=day + 1)
                predictions.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'predicted_risk': round(pred, 2),
                    'days_ahead': day + 1
                })
                current_values.append(pred)

            return predictions

        except Exception as e:
            print(f"predict_from_input failed: {e}", file=sys.stderr)
            return None

    def _trend(self, series):
        """Calculate linear trend slope of a series"""
        series = list(series)
        if len(series) < 2:
            return 0
        x = np.arange(len(series))
        coeffs = np.polyfit(x, series, 1)
        return float(coeffs[0])

    def predict(self, user_id, days_ahead=7, recent_risks=None):
        """
        Predict future risk scores using XGBoost.

        Strategy:
        1. Try to load a stored model for the user (works for numeric IDs)
        2. If no stored model (e.g. MongoDB ObjectId users), fall back to
           predict_from_input() using the provided recent_risks

        Args:
            user_id: User ID (numeric or MongoDB ObjectId string)
            days_ahead: Number of days to predict (3-7)
            recent_risks: List of recent risk scores [day1, day2, ...day7]

        Returns:
            List of prediction dicts with date/predicted_risk/days_ahead, or None
        """
        
        try:
            # Normalize recent_risks
            if recent_risks is None or len(recent_risks) == 0:
                recent_risks = [5.0] * 7

            # --- Try stored model first ---
            model, scaler = self._load_model(user_id)

            if model is not None:
                # Use stored model with full feature pipeline
                while len(recent_risks) < 7:
                    recent_risks = [recent_risks[0]] + recent_risks

                predictions = []
                current_values = list(recent_risks)

                for day in range(days_ahead):
                    features_dict = {}

                    for lag in range(1, 8):
                        features_dict[f'lag_{lag}'] = current_values[-lag] if lag <= len(current_values) else current_values[0]

                    last_7 = current_values[-7:] if len(current_values) >= 7 else current_values
                    features_dict['rolling_mean_3'] = np.mean(last_7[-3:]) if len(last_7) >= 3 else np.mean(last_7)
                    features_dict['rolling_mean_7'] = np.mean(last_7)
                    features_dict['rolling_std_3'] = np.std(last_7[-3:]) if len(last_7) >= 3 else 0
                    features_dict['rolling_std_7'] = np.std(last_7) if np.std(last_7) > 0 else 0.1
                    features_dict['trend_7'] = self._trend(last_7)

                    future_date = datetime.now() + timedelta(days=day + 1)
                    features_dict['day_of_week'] = future_date.weekday()

                    X_new = np.array([features_dict[col] for col in self.feature_cols], dtype=float).reshape(1, -1)
                    X_new_scaled = scaler.transform(X_new)
                    pred = float(np.clip(model.predict(X_new_scaled)[0], 0, 10))

                    predictions.append({
                        'date': future_date.strftime('%Y-%m-%d'),
                        'predicted_risk': round(pred, 2),
                        'days_ahead': day + 1
                    })
                    current_values.append(pred)

                return predictions

            # --- Fallback: predict from input data (for MongoDB ObjectId users) ---
            print(f"Info: Using input-based prediction for user {user_id}", file=sys.stderr)
            return self.predict_from_input(recent_risks=recent_risks, days_ahead=days_ahead)

        except Exception as e:
            print(f"XGBoost prediction error for user {user_id}: {e}", file=sys.stderr)
            return None


# Example usage
if __name__ == "__main__":
    predictor = XGBoostPredictor()

    # Test with a MongoDB-style user ID + recent_risks (the failing case)
    print("Testing with MongoDB ObjectId user + recent_risks:")
    preds = predictor.predict(
        user_id="6991d4bab623b438ad438f33",
        days_ahead=7,
        recent_risks=[4.2, 4.5, 4.8, 5.0, 5.1, 4.9, 4.5]
    )

    if preds:
        for p in preds:
            risk_level = "CRITICAL" if p['predicted_risk'] >= 7 else \
                        "HIGH" if p['predicted_risk'] >= 5.5 else \
                        "MODERATE" if p['predicted_risk'] >= 3 else "LOW"
            print(f"  {p['date']}: {p['predicted_risk']}/10 ({risk_level})")
    else:
        print("  No prediction available")
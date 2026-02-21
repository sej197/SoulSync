"""
Train XGBoost models for risk score prediction
Creates one XGBoost model per user to predict risk 3-7 days ahead
Uses feature engineering: lags, rolling averages, volatility, etc.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import warnings
warnings.filterwarnings('ignore')

try:
    from xgboost import XGBRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_absolute_error, mean_squared_error
except ImportError:
    print("ERROR: Missing required packages. Install with:")
    print("pip install xgboost scikit-learn")
    exit(1)

DATA_DIR = Path("data/training_data")
MODEL_DIR = Path("models/xgboost_models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def create_features(df, user_id, lags=7):
    """
    Create features for XGBoost from time series
    
    Features:
    - Lag features (previous 1-7 days)
    - Rolling averages (3-day, 7-day)
    - Rolling volatility
    - Trend (linear)
    - Day of week
    """
    
    user_data = df[df['user_id'] == user_id].sort_values('date').reset_index(drop=True)
    data = user_data[['risk_score']].copy()
    
    # Lag features (previous N days)
    for lag in range(1, lags + 1):
        data[f'lag_{lag}'] = data['risk_score'].shift(lag)
    
    # Rolling averages
    data['rolling_mean_3'] = data['risk_score'].rolling(window=3, min_periods=1).mean()
    data['rolling_mean_7'] = data['risk_score'].rolling(window=7, min_periods=1).mean()
    
    # Rolling volatility (std)
    data['rolling_std_3'] = data['risk_score'].rolling(window=3, min_periods=1).std()
    data['rolling_std_7'] = data['risk_score'].rolling(window=7, min_periods=1).std()
    
    # Trend (linear fit slope over last 7 days)
    def trend_fit(series):
        if len(series) < 2:
            return 0
        x = np.arange(len(series))
        coeffs = np.polyfit(x, series, 1)
        return coeffs[0]  # slope
    
    data['trend_7'] = data['risk_score'].rolling(window=7, min_periods=2).apply(
        lambda x: trend_fit(x.values)
    )
    
    # Day of week
    days = pd.to_datetime(user_data['date'])
    data['day_of_week'] = days.dt.dayofweek
    
    # Fill NaN from shifting
    data = data.fillna(method='bfill').fillna(method='ffill')
    
    return data


def train_xgboost_per_user(df):
    """
    Train XGBoost model for each user
    
    Args:
        df: Risk timeseries DataFrame
    
    Returns:
        Dictionary of trained models and metrics
    """
    
    models = {}
    scalers = {}  # Store scalers for later use
    metrics = {}
    
    for user_id in sorted(df['user_id'].unique()):
        print(f"User {user_id}: Creating features...")
        
        try:
            # Create features
            featurized = create_features(df, user_id, lags=7)
            
            # Separate features and target
            feature_cols = [col for col in featurized.columns if col != 'risk_score']
            X = featurized[feature_cols].values
            y = featurized['risk_score'].values
            
            # Split: 80% train, 20% test
            split_point = int(len(X) * 0.8)
            X_train, X_test = X[:split_point], X[split_point:]
            y_train, y_test = y[:split_point], y[split_point:]
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            print(f"  Training on {len(X_train)} samples, testing on {len(X_test)} samples...")
            
            # Train XGBoost
            model = XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbosity=0
            )
            
            model.fit(X_train_scaled, y_train)
            
            # Make predictions
            predictions = model.predict(X_test_scaled)
            
            # Calculate metrics
            mae = mean_absolute_error(y_test, predictions)
            rmse = np.sqrt(mean_squared_error(y_test, predictions))
            
            # Store model and scaler
            models[user_id] = model
            scalers[user_id] = scaler
            metrics[user_id] = {
                'mae': mae,
                'rmse': rmse,
                'train_size': len(X_train),
                'test_size': len(X_test),
                'feature_count': len(feature_cols),
                'status': 'success'
            }
            
            print(f"  ✓ User {user_id}: MAE={mae:.3f}, RMSE={rmse:.3f}")
            
        except Exception as e:
            print(f"  ✗ User {user_id} failed: {str(e)}")
            metrics[user_id] = {
                'status': 'failed',
                'error': str(e)
            }
    
    return models, scalers, metrics


def save_models(models, scalers, metrics):
    """Save trained models and scalers to disk"""
    
    # Save individual models
    for user_id, model in models.items():
        model_file = MODEL_DIR / f"user_{user_id}_xgb.pkl"
        with open(model_file, 'wb') as f:
            pickle.dump(model, f)
        
        # Save scaler
        scaler_file = MODEL_DIR / f"user_{user_id}_scaler.pkl"
        with open(scaler_file, 'wb') as f:
            pickle.dump(scalers[user_id], f)
    
    # Save metrics
    metrics_df = pd.DataFrame(metrics).T
    metrics_file = MODEL_DIR / "xgboost_metrics.csv"
    metrics_df.to_csv(metrics_file)
    
    print(f"\n✓ Saved {len(models)} XGBoost models to {MODEL_DIR}")
    print(f"✓ Saved {len(scalers)} scalers to {MODEL_DIR}")
    print(f"✓ Saved metrics to {metrics_file}")


def predict_future_risk(user_id, model, scaler, last_values, feature_cols, days_ahead=7):
    """
    Predict future risk scores using XGBoost
    
    Args:
        user_id: User ID
        model: Trained XGBoost model
        scaler: Feature scaler
        last_values: Last risk scores (for lag features)
        feature_cols: Feature column names
        days_ahead: Days to predict
    
    Returns:
        Array of predicted risk scores
    """
    try:
        predictions = []
        current_values = last_values.copy()
        
        for day in range(days_ahead):
            # Build features from current state
            features_dict = {}
            
            # Lag features
            for lag in range(1, 8):
                if lag <= len(current_values):
                    features_dict[f'lag_{lag}'] = current_values[-(lag)]
            
            # Rolling features (calculate from last 7)
            last_7 = current_values[-7:] if len(current_values) >= 7 else current_values
            features_dict['rolling_mean_3'] = np.mean(last_7[-3:])
            features_dict['rolling_mean_7'] = np.mean(last_7)
            features_dict['rolling_std_3'] = np.std(last_7[-3:])
            features_dict['rolling_std_7'] = np.std(last_7)
            
            # Trend
            if len(last_7) >= 2:
                x = np.arange(len(last_7))
                coeffs = np.polyfit(x, last_7, 1)
                features_dict['trend_7'] = coeffs[0]
            else:
                features_dict['trend_7'] = 0
            
            # Day of week (0=Monday, 6=Sunday)
            from datetime import datetime, timedelta
            future_date = datetime.now() + timedelta(days=day+1)
            features_dict['day_of_week'] = future_date.weekday()
            
            # Create feature vector in correct order
            X_new = np.array([features_dict.get(col, 0) for col in feature_cols]).reshape(1, -1)
            X_new_scaled = scaler.transform(X_new)
            
            # Predict
            pred = model.predict(X_new_scaled)[0]
            pred = np.clip(pred, 0, 10)  # Clamp to valid range
            predictions.append(pred)
            
            # Add prediction to history for next iteration
            current_values.append(pred)
        
        return np.array(predictions)
        
    except Exception as e:
        print(f"XGBoost prediction failed for user {user_id}: {e}")
        return None


def main():
    print("=" * 80)
    print("TRAINING XGBOOST MODELS FOR RISK PREDICTION")
    print("=" * 80)
    
    # Load data
    print("\n[1/4] Loading training data...")
    risk_file = DATA_DIR / "risk_timeseries.csv"
    df = pd.read_csv(risk_file)
    print(f"✓ Loaded {len(df)} records for {df['user_id'].nunique()} users")
    
    # Train models
    print("\n[2/4] Training XGBoost models...")
    models, scalers, metrics = train_xgboost_per_user(df)
    successful = sum(1 for m in metrics.values() if m.get('status') == 'success')
    print(f"\n✓ Successfully trained {successful}/{len(metrics)} user models")
    
    # Save models
    print("\n[3/4] Saving trained models...")
    save_models(models, scalers, metrics)
    
    # Show performance summary
    print("\n[4/4] Performance Summary")
    print("=" * 80)
    metrics_df = pd.DataFrame(metrics).T
    metrics_df = metrics_df[metrics_df['status'] == 'success']
    
    if len(metrics_df) > 0:
        print(f"Mean Absolute Error (MAE): {metrics_df['mae'].mean():.3f}")
        print(f"Root Mean Squared Error (RMSE): {metrics_df['rmse'].mean():.3f}")
        print(f"\nBest performer: User {metrics_df['mae'].idxmin()} (MAE={metrics_df['mae'].min():.3f})")
        print(f"Worst performer: User {metrics_df['mae'].idxmax()} (MAE={metrics_df['mae'].max():.3f})")
    
    print("\n" + "=" * 80)
    print("✓ XGBoost training complete!")
    print(f"✓ Models ready for prediction at: {MODEL_DIR}")
    print("\nTo use in production:")
    print("  from services.xgboost_service import XGBoostPredictor")
    print("  predictor = XGBoostPredictor()")
    print("  predictions = predictor.predict(user_id=1, days_ahead=7)")


if __name__ == "__main__":
    main()

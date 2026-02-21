"""
Debug script to test XGBoost predictions
Run this to diagnose why predictions are returning None
"""

import sys
from pathlib import Path
from services.xgboost_service import XGBoostPredictor

print("=" * 80)
print("DEBUGGING XGBOOST PREDICTIONS")
print("=" * 80)

# Check if models directory exists
model_dir = Path("models/xgboost_models")
print(f"\n[1] Checking model directory...")
print(f"  Path: {model_dir}")
print(f"  Exists: {model_dir.exists()}")

if model_dir.exists():
    models = list(model_dir.glob("user_*_xgb.pkl"))
    print(f"  Models found: {len(models)}")
    print(f"  Sample models: {[m.name for m in models[:3]]}")
else:
    print("  ERROR: models/xgboost_models not found!")
    sys.exit(1)

# Test XGBoostPredictor
print(f"\n[2] Testing XGBoostPredictor...")
try:
    predictor = XGBoostPredictor()
    print(f"  ✓ Predictor initialized")
    print(f"  Feature cols: {predictor.feature_cols}")
except Exception as e:
    print(f"  ✗ Failed to initialize: {e}")
    sys.exit(1)

# Test predictions for different users
print(f"\n[3] Testing predictions...")
test_users = [1, 5, 10, 30, 999]  # 999 doesn't exist

for user_id in test_users:
    try:
        # Test with default (no recent_risks)
        pred_default = predictor.predict(user_id=user_id, days_ahead=3)
        
        if pred_default:
            print(f"  User {user_id}: ✓ ({len(pred_default)} predictions)")
            print(f"    Day 1 risk: {pred_default[0]['predicted_risk']}")
        else:
            print(f"  User {user_id}: ✗ Returned None (no model?)")
        
        # Test with recent_risks provided
        recent = [4.5, 4.7, 4.9, 5.1, 4.8, 4.6, 5.0]
        pred_custom = predictor.predict(user_id=user_id, days_ahead=3, recent_risks=recent)
        
        if pred_custom:
            print(f"    With recent_risks: ✓")
        else:
            print(f"    With recent_risks: ✗")
            
    except Exception as e:
        print(f"  User {user_id}: ERROR - {e}")

# Check specific model files
print(f"\n[4] Checking model files for User 1...")
model_file = model_dir / "user_1_xgb.pkl"
scaler_file = model_dir / "user_1_scaler.pkl"

print(f"  Model file exists: {model_file.exists()}")
print(f"  Scaler file exists: {scaler_file.exists()}")

if model_file.exists():
    print(f"  Model size: {model_file.stat().st_size} bytes")
if scaler_file.exists():
    print(f"  Scaler size: {scaler_file.stat().st_size} bytes")

# Try loading directly
print(f"\n[5] Attempting direct model load for User 1...")
try:
    import pickle
    with open(model_file, 'rb') as f:
        model = pickle.load(f)
    print(f"  ✓ Model loaded successfully")
    print(f"  Model type: {type(model)}")
except Exception as e:
    print(f"  ✗ Failed to load model: {e}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("\nIf predictions are None:")
print("  1. Check if user_id has a trained model (user_X_xgb.pkl exists)")
print("  2. Check if recent_risks is being passed correctly")
print("  3. Check recent_risks has 7+ days of data")
print("  4. Check models/xgboost_models/ directory permissions")

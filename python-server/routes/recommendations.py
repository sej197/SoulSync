from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.recommendations import get_recommendations
from services.xgboost_service import XGBoostPredictor
import traceback
import sys

router = APIRouter()
xgb_predictor = XGBoostPredictor()  # Initialize once


class RecommendationRequest(BaseModel):
    user_id:                      str                    # User identifier for XGBoost prediction
    risk_level:                  str                    # LOW | MODERATE | HIGH | CRITICAL
    risk_score:                  Optional[float] = 5.0  # Current risk score (0-10)
    trend:                       str                    # improving | stable | declining | unknown
    top_factors:                 Optional[List[str]] = []
    days_since_checkin:          Optional[int] = 0
    consecutive_high_risk_days:  Optional[int] = 0
    recent_risks:                Optional[List[float]] = []  # Last 7 days of risk scores for XGBoost


@router.post("/recommendations")
async def recommendations(body: RecommendationRequest):
    """
    Generate recommendations with XGBoost risk prediction
    
    Request:
    {
        "user_id": "user_123",
        "risk_level": "MODERATE",
        "risk_score": 4.5,
        "trend": "stable",
        "top_factors": ["anxiety", "sleep"],
        "recent_risks": [4.2, 4.5, 4.8, 5.0, 5.1, 4.9, 4.5]  # Last 7 days
    }
    
    Response:
    {
        "motivational_message": "...",
        "coping_steps": [...],
        "xgboost_prediction": [...],  # NEW
        "early_warning": false|true    # NEW
    }
    """
    try:
        # Get current recommendation (existing logic)
        request_dict = body.dict()
        result = get_recommendations(request_dict)
        
        # NEW: Get XGBoost prediction
        user_id = body.user_id
        current_risk = body.risk_score
        recent_risks = body.recent_risks if body.recent_risks else [current_risk] * 7
        
        # Debug logging
        print(f"[Recommendations] User: {user_id}, Risk: {current_risk}, Recent: {len(recent_risks) if recent_risks else 0} days", file=sys.stderr)
        
        xgb_pred = xgb_predictor.predict(user_id=user_id, days_ahead=7, recent_risks=recent_risks)
        
        # Debug: log if prediction failed
        if xgb_pred is None:
            print(f"[WARNING] XGBoost prediction returned None for user {user_id}", file=sys.stderr)
        else:
            print(f"[XGBoost] Got {len(xgb_pred)} predictions for user {user_id}", file=sys.stderr)
        
        # NEW: Check for early warning (risk spike detected)
        early_warning = False
        if xgb_pred:
            max_future_risk = max([p['predicted_risk'] for p in xgb_pred])
            days_to_peak = next((p['days_ahead'] for p in xgb_pred 
                                if p['predicted_risk'] == max_future_risk), None)
            
            # Warning if peak crosses CRITICAL and current is not already critical
            if max_future_risk >= 7 and current_risk < 7:
                early_warning = True
            # Warning if significant spike coming (+ 2 points) in next 3 days
            elif days_to_peak and days_to_peak <= 3 and max_future_risk >= current_risk + 1.5:
                early_warning = True
        
        # Return enhanced response
        result['xgboost_prediction'] = xgb_pred
        result['early_warning'] = early_warning
        
        return result
        
    except Exception as e:
        print(f"Recommendation error: {str(e)}", file=sys.stderr)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predict/{user_id}")
async def predict_user_risk(user_id: str, days: int = 7):
    """
    Standalone prediction endpoint - returns only XGBoost forecast
    
    Example: GET /api/predict/user_123?days=7
    
    Response:
    {
        "user_id": "user_123",
        "predictions": [
            {"date": "2026-02-22", "predicted_risk": 4.5, "days_ahead": 1},
            ...
        ],
        "peak_risk": 5.8,
        "peak_date": "2026-02-24"
    }
    """
    try:
        predictions = xgb_predictor.predict(user_id=user_id, days_ahead=days)
        
        if not predictions:
            return {
                "user_id": user_id,
                "predictions": [],
                "message": "No XGBoost model for this user yet"
            }
        
        # Find peak risk
        risks = [p['predicted_risk'] for p in predictions]
        peak_risk = max(risks)
        peak_idx = risks.index(peak_risk)
        peak_date = predictions[peak_idx]['date']
        
        return {
            "user_id": user_id,
            "predictions": predictions,
            "peak_risk": peak_risk,
            "peak_date": peak_date,
            "days_to_peak": predictions[peak_idx]['days_ahead']
        }
        
    except Exception as e:
        print(f"Prediction error for user {user_id}: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/risk-weights")
async def get_risk_weights():
    """
    Returns dynamically learned weights for risk components using XGBoost
    """
    try:
        weights = xgb_predictor.get_risk_weights()
        if not weights:
             # Fallback to current hardcoded defaults if model not found
             return {
                "depression_quiz_score": 0.20,
                "anxiety_quiz_score":    0.15,
                "stress_quiz_score":     0.15,
                "sleep_quiz_score":      0.12,
                "journal_score":         0.13,
                "chatbot_score":         0.11,
                "quiz_score":            0.07,
                "community_score":       0.03,
                "disengagement_score":   0.04
            }
        return weights
    except Exception as e:
        print(f"Error fetching risk weights: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))

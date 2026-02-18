from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.recommendations import get_recommendations

router = APIRouter()


class RecommendationRequest(BaseModel):
    risk_level:                  str                    # LOW | MODERATE | HIGH | CRITICAL
    trend:                       str                    # improving | stable | declining | unknown
    top_factors:                 Optional[List[str]] = []
    days_since_checkin:          Optional[int] = 0
    consecutive_high_risk_days:  Optional[int] = 0


@router.post("/recommendations")
async def recommendations(body: RecommendationRequest):
    try:
        result = get_recommendations(body.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
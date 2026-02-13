from fastapi import APIRouter
from pydantic import BaseModel
from services.sentiment_service import get_mental_health_score
router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/analyze")
def analyze_text(data: TextInput):
    score = get_mental_health_score(data.text)
    return {"paragraphScore": round(score, 3)}

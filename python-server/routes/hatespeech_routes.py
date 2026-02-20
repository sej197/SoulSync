from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from services.hatespeech_service import get_hate_speech_score
from typing import Dict

router = APIRouter(
    tags=["HateSpeech"]
)

class TextInput(BaseModel):
    text: str = Field(..., example="Your text here")

class HateSpeechResponse(BaseModel):
    paragraphScore: float = Field(..., example=0.123)

@router.post("/analyze", response_model=HateSpeechResponse, status_code=status.HTTP_200_OK)

async def analyze_text(data: TextInput) -> Dict[str, float]:
    if not data.text.strip():
        return {"paragraphScore": 0.0}

    try:
        score = get_hate_speech_score(data.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing text: {str(e)}"
        )

    return {"paragraphScore": round(score, 3)}

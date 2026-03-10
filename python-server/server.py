from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routes.sentiment_routes import router as sentiment_router
from routes.hatespeech_routes import router as hatespeech_router
import routes.recommendations as recommendation
from routes.adaptive_quiz import router as adaptive_quiz_router

app = FastAPI()

client_url = os.environ.get("CLIENT_URL", "http://localhost:5173")
origins = [url.strip() for url in client_url.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sentiment_router, prefix="/sentiment")
app.include_router(hatespeech_router, prefix="/hatespeech")
app.include_router(recommendation.router, prefix="/api")
app.include_router(adaptive_quiz_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Mental Health Sentiment API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
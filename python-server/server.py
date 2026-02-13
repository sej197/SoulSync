from fastapi import FastAPI
from routes.sentiment_routes import router as sentiment_router

app = FastAPI()

app.include_router(sentiment_router, prefix="/sentiment")

@app.get("/")
def root():
    return {"message": "Mental Health Sentiment API Running"}

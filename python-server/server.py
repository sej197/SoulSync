from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file FIRST before importing routes
load_dotenv()

from routes.sentiment_routes import router as sentiment_router
import routes.recommendations as recommendation

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sentiment_router, prefix="/sentiment")
app.include_router(recommendation.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Mental Health Sentiment API Running"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
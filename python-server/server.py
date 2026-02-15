from fastapi import FastAPI
from routes.sentiment_routes import router as sentiment_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sentiment_router, prefix="/sentiment")

@app.get("/")
def root():
    return {"message": "Mental Health Sentiment API Running"}

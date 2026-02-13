from textblob import TextBlob

def get_mental_health_score(text: str) -> float:
    if not text or len(text.strip()) == 0:
        return 0.5

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity 

    negativity_score = (1 - polarity) / 2

    return float(negativity_score)

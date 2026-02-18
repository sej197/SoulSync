from textblob import TextBlob

RISK_KEYWORDS = [
    "die", "kill myself", "suicide", "end my life", "no reason to live", 
    "hurt myself", "self harm", "don't want to live", "killing myself",
    "better off dead", "worthless", "give up", "nothing left"
]

def get_mental_health_score(text: str) -> float:
    if not text or len(text.strip()) == 0:
        return 0.5

    text_lower = text.lower()
    
    # Check for critical keywords first
    for keyword in RISK_KEYWORDS:
        if keyword in text_lower:
            return 0.9  # High risk

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity 

    # polarity ranges from -1 to 1
    # -1 (very negative) -> 1.0 (very high risk)
    # 0 (neutral) -> 0.5 (medium risk)
    # 1 (very positive) -> 0.0 (low risk)
    negativity_score = (1 - polarity) / 2

    return float(negativity_score)

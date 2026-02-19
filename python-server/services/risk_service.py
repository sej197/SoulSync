from transformers import pipeline

class RiskDetector:
    def __init__(self):
        # Load the fine-tuned BERT model for mental health classification
        # Note: This might take a while on the first load
        self.classifier = pipeline(
            "text-classification", 
            model="distilbert-base-uncased-finetuned-sst-2-english",
             device=-1 # Use CPU
        )

    def detect_risk(self, text: str):
        if not text or len(text.strip()) == 0:
            return {"label": "Normal", "score": 0.0}
        
        results = self.classifier(text)
        # Results format: [{'label': 'LABEL_NAME', 'score': 0.99}]
        # Possible labels for this model: Anxiety, Depression, Normal, Suicidal
        return results[0]

# Singleton instance
detector = RiskDetector()

def get_risk_analysis(text: str):
    return detector.detect_risk(text)

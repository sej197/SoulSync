import sys
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
model = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")

def get_sentiment_score_5star(text):
    if not text or len(text.strip()) == 0:
        return 0.5
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    stars = torch.arange(1,6)
    score = torch.sum(probs * stars).item()
    final_score = 1 - (score - 1)/4
    return round(final_score, 2)

if __name__ == "__main__":
    text = " ".join(sys.argv[1:])
    print(get_sentiment_score_5star(text))

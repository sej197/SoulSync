from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch


tokenizer = None
model = None

def load_hate_speech_model():
    global tokenizer, model
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained("unitary/toxic-bert", cache_dir="./model")
        model = AutoModelForSequenceClassification.from_pretrained("unitary/toxic-bert", cache_dir="./model")
        print("Hate speech model loaded successfully")

def get_hate_speech_score(text: str) -> float:
    if not text or len(text.strip()) == 0:
        return 0.0

    load_hate_speech_model()
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.sigmoid(outputs.logits)
    return float(probs[0][0].item())
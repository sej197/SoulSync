from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("unitary/toxic-bert", cache_dir="./model")
model = AutoModelForSequenceClassification.from_pretrained("unitary/toxic-bert", cache_dir="./model")

def get_hate_speech_score(text: str) -> float:
    if not text or len(text.strip()) == 0:
        return 0.0  

    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.sigmoid(outputs.logits)

    toxic_score = probs[0][0].item()
    return float(toxic_score)

# close to 1 is toxic, close to 0 is non-toxic
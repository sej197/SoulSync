"""
Fine-tune a 7B LLM with LoRA adapter for personalized mental health recommendations
Uses HuggingFace transformers + PEFT (Parameter-Efficient Fine-Tuning)
"""

import pandas as pd
import json
import torch
import numpy as np
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

try:
    from transformers import (
        AutoTokenizer, 
        AutoModelForCausalLM,
        TrainingArguments,
        Trainer,
        DataCollatorForLanguageModeling
    )
    from peft import LoraConfig, get_peft_model, TaskType
    from datasets import Dataset
except ImportError:
    print("ERROR: Missing required packages. Install with:")
    print("pip install transformers peft datasets torch")
    exit(1)

DATA_DIR = Path("data/training_data")
MODEL_DIR = Path("models/lora_adapter")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Configuration
BASE_MODEL = "mistralai/Mistral-7B-v0.1"  # Small, efficient model
BATCH_SIZE = 4  # Small batch for low-memory environments
EPOCHS = 3
LEARNING_RATE = 1e-4


def format_training_example(row):
    """
    Convert raw training pair into instruction-following format
    Compatible with common LLM fine-tuning templates
    """
    
    input_context = json.loads(row['input_context'])
    output = json.loads(row['output_recommendation'])
    
    # Format as instruction-response pair
    instruction = f"""You are a compassionate mental health companion. A user has the following situation:

Risk Level: {input_context['risk_level']}
Current Risk Score: {input_context['risk_score']}/10
Trend: {input_context['trend']}
Key Challenges: {input_context['top_factors']}
Days Since Last Check-in: {input_context['days_since_checkin']}
Consecutive High-Risk Days: {input_context['consecutive_high_risk_days']}

Provide a compassionate response with:
1. A brief motivational message
2. Two specific CBT-based coping strategies

Keep the response warm, personalized, and actionable."""
    
    response = f"""Motivational Message:
{output['motivational_message']}

Coping Strategies:
1. {output['coping_steps'][0] if len(output['coping_steps']) > 0 else 'Practice mindfulness'}
2. {output['coping_steps'][1] if len(output['coping_steps']) > 1 else 'Engage in self-care'}"""
    
    # Combine into single text for language modeling
    formatted_text = f"""### Instruction:
{instruction}

### Response:
{response}

### End"""
    
    return formatted_text


def prepare_dataset(df):
    """
    Prepare dataset for LoRA fine-tuning
    
    Args:
        df: DataFrame with training pairs
    
    Returns:
        HuggingFace Dataset object
    """
    
    print(f"Preparing {len(df)} training examples...")
    
    # Format examples
    texts = []
    for idx, row in df.iterrows():
        try:
            text = format_training_example(row)
            texts.append({'text': text})
        except Exception as e:
            print(f"  Warning: Failed to format row {idx}: {e}")
            continue
    
    dataset = Dataset.from_dict({
        'text': [t['text'] for t in texts]
    })
    
    print(f"✓ Prepared {len(dataset)} examples")
    
    # Split into train/validation (80/20)
    split_dataset = dataset.train_test_split(test_size=0.2, seed=42)
    
    return split_dataset['train'], split_dataset['test']


def setup_lora_model():
    """
    Setup base model with LoRA adapter
    
    Returns:
        Tokenizer, Model with LoRA
    """
    
    print(f"Loading base model: {BASE_MODEL}")
    print("  (This may take a minute on first run)")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Load model with reduced precision for memory efficiency
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    # Configure LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=8,  # LoRA rank
        lora_alpha=32,  # LoRA scaling
        lora_dropout=0.05,
        bias="none",
        target_modules=["q_proj", "v_proj"]  # Mistral attention modules
    )
    
    # Apply LoRA
    model = get_peft_model(model, lora_config)
    
    print(f"✓ Model loaded with LoRA adapter")
    print(f"✓ Trainable parameters: {model.get_nb_trainable_parameters():,}")
    print(f"✓ All parameters: {model.get_nb_parameters():,}")
    print(f"✓ Trainable ratio: {100 * model.get_nb_trainable_parameters() / model.get_nb_parameters():.2f}%")
    
    return tokenizer, model


def train_lora(train_dataset, eval_dataset, tokenizer, model):
    """
    Fine-tune model with LoRA
    
    Args:
        train_dataset: Training dataset
        eval_dataset: Evaluation dataset
        tokenizer: Tokenizer
        model: Model with LoRA
    
    Returns:
        Trained model
    """
    
    print("\nConfiguring training parameters...")
    
    training_args = TrainingArguments(
        output_dir=str(MODEL_DIR / "training_output"),
        overwrite_output_dir=True,
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        save_steps=10,
        save_total_limit=3,
        logging_steps=5,
        learning_rate=LEARNING_RATE,
        weight_decay=0.01,
        warmup_steps=5,
        eval_strategy="steps",
        eval_steps=10,
        save_strategy="steps",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        gradient_accumulation_steps=2,
        fp16=True,  # Mixed precision for speed
        optim="adamw_8bit",  # Memory efficient optimizer
    )
    
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=data_collator,
    )
    
    print("Starting fine-tuning... (this may take 5-10 minutes)")
    print("-" * 80)
    
    trainer.train()
    
    print("-" * 80)
    print("✓ Fine-tuning complete!")
    
    return model, trainer


def save_lora_model(model, tokenizer):
    """Save LoRA adapter and tokenizer"""
    
    print("\nSaving LoRA adapter...")
    
    # Save adapter
    model.save_pretrained(str(MODEL_DIR / "adapter"))
    
    # Save tokenizer
    tokenizer.save_pretrained(str(MODEL_DIR / "tokenizer"))
    
    # Save config
    config = {
        'base_model': BASE_MODEL,
        'training_date': datetime.now().isoformat(),
        'epochs': EPOCHS,
        'batch_size': BATCH_SIZE,
        'learning_rate': LEARNING_RATE
    }
    
    config_file = MODEL_DIR / "config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✓ LoRA adapter saved to {MODEL_DIR / 'adapter'}")
    print(f"✓ Tokenizer saved to {MODEL_DIR / 'tokenizer'}")
    print(f"✓ Config saved to {config_file}")


def test_inference(model, tokenizer):
    """Test the fine-tuned model with a sample prompt"""
    
    print("\n" + "=" * 80)
    print("TESTING FINE-TUNED MODEL")
    print("=" * 80)
    
    test_prompt = """### Instruction:
You are a compassionate mental health companion. A user has the following situation:

Risk Level: MODERATE
Current Risk Score: 4.5/10
Trend: declining
Key Challenges: anxiety, sleep deprivation
Days Since Last Check-in: 1
Consecutive High-Risk Days: 0

Provide a compassionate response with:
1. A brief motivational message
2. Two specific CBT-based coping strategies

Keep the response warm, personalized, and actionable.

### Response:"""
    
    # Tokenize
    inputs = tokenizer.encode(test_prompt, return_tensors="pt").to(model.device)
    
    # Generate
    outputs = model.generate(
        inputs,
        max_length=500,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    print("Sample Input:")
    print(test_prompt)
    print("\nModel Output:")
    print(response)
    print("=" * 80)


def main():
    print("=" * 80)
    print("LoRA FINE-TUNING FOR MENTAL HEALTH RECOMMENDATIONS")
    print("=" * 80)
    
    # Check GPU availability
    print(f"\nGPU Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Load data
    print("\n[1/5] Loading training data...")
    pair_file = DATA_DIR / "recommendation_pairs.csv"
    df = pd.read_csv(pair_file)
    print(f"✓ Loaded {len(df)} training examples")
    
    # Prepare dataset
    print("\n[2/5] Preparing dataset...")
    train_dataset, eval_dataset = prepare_dataset(df)
    
    # Setup model
    print("\n[3/5] Setting up LoRA model...")
    tokenizer, model = setup_lora_model()
    
    # Train
    print("\n[4/5] Fine-tuning with LoRA...")
    model, trainer = train_lora(train_dataset, eval_dataset, tokenizer, model)
    
    # Save
    print("\n[5/5] Saving model...")
    save_lora_model(model, tokenizer)
    
    # Test inference
    test_inference(model, tokenizer)
    
    print("\n" + "=" * 80)
    print("✓ LoRA FINE-TUNING COMPLETE!")
    print("=" * 80)
    print("\nTo use in production:")
    print("  from peft import AutoPeftModelForCausalLM")
    print("  model = AutoPeftModelForCausalLM.from_pretrained('models/lora_adapter/adapter')")
    print("  tokenizer = AutoTokenizer.from_pretrained('models/lora_adapter/tokenizer')")
    print("  # Generate: model.generate(inputs, max_length=500)")


if __name__ == "__main__":
    main()

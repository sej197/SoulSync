"""
Generate training datasets for ARIMA and LoRA fine-tuning
Creates 3 CSV files from 10 users × 5 days synthetic data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

# Create data directory
DATA_DIR = Path("data/training_data")
DATA_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================================
# SCHEMA 1: RISK TIME SERIES (for ARIMA)
# ============================================================================
def generate_risk_timeseries(num_users=30, days=90):
    """
    Generate synthetic risk score time series for multiple users
    Extends 10 users × 5 days → 30 users × 90 days
    
    Args:
        num_users: Number of synthetic users to create (default 30)
        days: Number of days per user (default 90)
    
    Returns:
        DataFrame with columns: user_id, date, risk_score, risk_level, trend
    """
    
    data = []
    start_date = datetime(2024, 11, 1)  # Start from 3 months ago
    
    # Create 3 user archetypes, each with 10 variations
    archetypes = {
        'anxious': {
            'base_risk': 5.5,
            'volatility': 1.2,
            'trend': 'stable',
            'factors': ['anxiety', 'overthinking']
        },
        'depressive': {
            'base_risk': 4.2,
            'volatility': 0.8,
            'trend': 'declining',
            'factors': ['depression', 'motivation']
        },
        'unstable': {
            'base_risk': 5.0,
            'volatility': 1.8,
            'trend': 'volatile',
            'factors': ['multiple']
        }
    }
    
    user_id = 1
    
    for archetype_name, archetype_config in archetypes.items():
        # Create 10 variations per archetype
        for variation in range(10):
            base_risk = archetype_config['base_risk']
            volatility = archetype_config['volatility']
            
            # Add variation to each user
            personal_offset = np.random.uniform(-0.5, 0.5)
            base_risk += personal_offset
            
            # Generate trend for this user
            trend_type = archetype_config['trend']
            if trend_type == 'declining':
                trend_slope = -0.01  # Slight improvement over time
            elif trend_type == 'improving':
                trend_slope = 0.01
            else:
                trend_slope = 0
            
            # Generate risk scores for 90 days
            risk_scores = []
            current_risk = base_risk
            
            for day in range(days):
                # Add trend
                current_risk += trend_slope
                
                # Add random volatility (realistic daily variation)
                daily_noise = np.random.normal(0, volatility * 0.3)
                current_risk += daily_noise
                
                # Weekly pattern
                day_of_week = (day + 3) % 7
                if variation % 2 == 0:
                    if day_of_week >= 5: current_risk += 0.3
                else:
                    if day_of_week < 2: current_risk += 0.2
                
                current_risk = np.clip(current_risk, 0, 10)
                risk_scores.append(current_risk)
            
            # Create records for this user
            for day, risk_score in enumerate(risk_scores):
                date = start_date + timedelta(days=day)
                
                # Determine risk level
                if risk_score >= 7.5: risk_level = 'CRITICAL'
                elif risk_score >= 6.0: risk_level = 'HIGH'
                elif risk_score >= 4.0: risk_level = 'MODERATE'
                else: risk_level = 'LOW'
                
                # Determine trend
                if day > 0:
                    prev_risk = risk_scores[day - 1]
                    trend = 'declining' if risk_score > prev_risk + 0.2 else 'improving' if risk_score < prev_risk - 0.2 else 'stable'
                else:
                    trend = 'stable'

                # Generate individual components based on risk_score and archetype
                # These will be used to "learn" the weights
                noise_level = 0.1
                
                # Component generation with some archetype-specific bias
                if archetype_name == 'anxious':
                    anxiety = min(1.0, (risk_score / 10) + np.random.normal(0.1, noise_level))
                    depression = min(1.0, (risk_score / 10) + np.random.normal(-0.1, noise_level))
                elif archetype_name == 'depressive':
                    anxiety = min(1.0, (risk_score / 10) + np.random.normal(-0.1, noise_level))
                    depression = min(1.0, (risk_score / 10) + np.random.normal(0.1, noise_level))
                else:
                    anxiety = min(1.0, (risk_score / 10) + np.random.normal(0, noise_level))
                    depression = min(1.0, (risk_score / 10) + np.random.normal(0, noise_level))
                    
                stress = min(1.0, (risk_score / 10) + np.random.normal(0, noise_level))
                sleep = min(1.0, (1 - (risk_score / 10)) + np.random.normal(0, noise_level)) # inverse
                journal = min(1.0, (risk_score / 10) + np.random.normal(0.05, noise_level))
                chatbot = min(1.0, (risk_score / 10) + np.random.normal(-0.05, noise_level))
                quiz = min(1.0, (risk_score / 10) + np.random.normal(0, noise_level))
                community = min(1.0, (1 - (risk_score / 10)) + np.random.normal(0, noise_level))
                disengagement = min(1.0, (risk_score / 20) + (day % 5 == 0) * 0.2) # occasional spikes
                
                data.append({
                    'user_id': user_id,
                    'date': date.strftime('%Y-%m-%d'),
                    'risk_score': round(risk_score, 2),
                    'risk_level': risk_level,
                    'trend': trend,
                    'depression_quiz_score': round(max(0, depression), 2),
                    'anxiety_quiz_score': round(max(0, anxiety), 2),
                    'stress_quiz_score': round(max(0, stress), 2),
                    'sleep_quiz_score': round(max(0, sleep), 2),
                    'journal_score': round(max(0, journal), 2),
                    'chatbot_score': round(max(0, chatbot), 2),
                    'quiz_score': round(max(0, quiz), 2),
                    'community_score': round(max(0, community), 2),
                    'disengagement_score': round(max(0, disengagement), 2)
                })
            
            user_id += 1
    
    df = pd.DataFrame(data)
    return df


# ============================================================================
# SCHEMA 2: CHECK-IN CONTEXT (for understanding + LoRA)
# ============================================================================
def generate_checkin_context(risk_df):
    """
    Generate contextual information for each check-in
    Adds: factors, days_since_checkin, user_type, etc.
    
    Args:
        risk_df: Risk time series DataFrame
    
    Returns:
        DataFrame with check-in context
    """
    
    context_data = []
    
    # Group by user to track patterns
    for user_id in risk_df['user_id'].unique():
        user_data = risk_df[risk_df['user_id'] == user_id].reset_index(drop=True)
        
        # Determine user type based on volatility
        risk_scores = user_data['risk_score'].values
        volatility = np.std(risk_scores)
        avg_risk = np.mean(risk_scores)
        
        if volatility > 1.5:
            user_type = 'volatile'
        elif avg_risk > 5.5:
            user_type = 'anxiety_prone'
        elif avg_risk < 3.5:
            user_type = 'stable'
        else:
            user_type = 'moderate'
        
        # Factor distribution for this user
        if user_type == 'anxiety_prone':
            factors = ['anxiety', 'overthinking', 'perfectionism']
        elif user_type == 'volatile':
            factors = ['mood_swings', 'stress', 'triggers']
        elif user_type == 'stable':
            factors = ['minor_stress', 'fatigue']
        else:
            factors = ['general_stress', 'sleep', 'work']
        
        # Generate context for each day
        days_since_checkin = 0
        consecutive_high_risk = 0
        
        for idx, row in user_data.iterrows():
            # Simulate check-in behavior (not every day)
            if idx == 0:
                days_since_checkin = 0
                consecutive_high_risk = 0
            else:
                if np.random.random() < 0.85:  # 85% daily check-in rate
                    days_since_checkin = 0
                else:
                    days_since_checkin += 1
                
                # Track consecutive high risk days
                if row['risk_level'] in ['HIGH', 'CRITICAL']:
                    consecutive_high_risk += 1
                else:
                    consecutive_high_risk = 0
            
            # Select top factors for today
            top_factors = list(np.random.choice(factors, size=np.random.randint(1, 3), replace=False))
            
            context_data.append({
                'user_id': user_id,
                'date': row['date'],
                'risk_score': row['risk_score'],
                'risk_level': row['risk_level'],
                'trend': row['trend'],
                'top_factors': ','.join(top_factors),
                'days_since_checkin': days_since_checkin,
                'consecutive_high_risk_days': consecutive_high_risk,
                'user_type': user_type,
                'volatility': round(volatility, 2),
                'avg_risk': round(avg_risk, 2)
            })
    
    df = pd.DataFrame(context_data)
    return df


# ============================================================================
# SCHEMA 3: RECOMMENDATION TRAINING PAIRS (for LoRA)
# ============================================================================
def generate_recommendation_pairs(checkin_df, num_samples=120):
    """
    Generate training pairs for LoRA fine-tuning
    Each pair: input context → output recommendation
    
    Args:
        checkin_df: Check-in context DataFrame
        num_samples: Number of training pairs to generate
    
    Returns:
        DataFrame with training pairs
    """
    
    # Sample diverse records
    sampled = checkin_df.sample(n=min(num_samples, len(checkin_df))).reset_index(drop=True)
    
    training_pairs = []
    
    for idx, row in sampled.iterrows():
        # Create input context
        input_context = {
            'risk_level': row['risk_level'],
            'risk_score': row['risk_score'],
            'trend': row['trend'],
            'top_factors': row['top_factors'],
            'days_since_checkin': row['days_since_checkin'],
            'consecutive_high_risk_days': row['consecutive_high_risk_days'],
            'user_type': row['user_type']
        }
        
        # Generate output recommendation based on context
        output_recommendation = generate_coping_recommendation(input_context)
        
        # Simulate feedback (in practice, this comes from real users)
        # For synthetic data: better recommendations get positive feedback
        helpfulness_score = calculate_helpfulness(input_context)
        feedback = 'helpful' if helpfulness_score > 0.5 else 'neutral'
        
        training_pairs.append({
            'user_id': row['user_id'],
            'date': row['date'],
            'input_context': json.dumps(input_context),
            'output_recommendation': json.dumps(output_recommendation),
            'feedback': feedback,
            'helpfulness_score': round(helpfulness_score, 2)
        })
    
    df = pd.DataFrame(training_pairs)
    return df


def generate_coping_recommendation(context):
    """Generate CBT-based coping recommendation based on context"""
    
    risk_level = context['risk_level']
    factors = context['top_factors'].split(',')
    user_type = context['user_type']
    
    # CBT techniques library
    cbt_techniques = {
        'anxiety': {
            'grounding': 'Try 5-4-3-2-1 grounding: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
            'breathing': 'Box breathing: Inhale 4, hold 4, exhale 4, hold 4. Repeat 5 times',
            'thought_record': 'Write down anxious thought, evidence for/against, realistic alternative'
        },
        'depression': {
            'activation': 'Behavioral activation: Schedule 3 small enjoyable activities today, even if you don\'t feel like it',
            'values': 'Connect with one value today: what matters to you? Do one thing aligned with it',
            'gratitude': 'List 3 small things that went okay today, no matter how small'
        },
        'stress': {
            'breaks': 'Take 3 intentional 5-minute breaks today. Step away, stretch, breathe',
            'prioritize': 'Pick your top 3 tasks. Let the rest go for today',
            'boundary': 'Set one boundary today: say no to one thing or set a time limit'
        },
        'sleep': {
            'hygiene': 'No screens 30 min before bed. Cool, dark room. Consistent bedtime',
            'wind_down': 'Progressive muscle relaxation: tense and release each muscle group',
            'schedule': 'Go to bed 15 min earlier than usual tonight'
        },
        'motivation': {
            'tiny_step': 'Do the smallest possible version of what you need to do',
            'reward': 'Plan a small reward after you complete one task',
            'energy': 'Start with what gives you energy, not what drains you'
        }
    }
    
    # Select appropriate techniques based on factors
    selected_techniques = []
    for factor in factors:
        factor_lower = factor.lower().replace(' ', '_')
        if factor_lower in cbt_techniques:
            technique = np.random.choice(list(cbt_techniques[factor_lower].values()))
            selected_techniques.append(technique)
    
    # Ensure we have 2 steps
    while len(selected_techniques) < 2:
        all_steps = []
        for techniques_dict in cbt_techniques.values():
            all_steps.extend(techniques_dict.values())
        selected_techniques.append(np.random.choice(all_steps))
    
    selected_techniques = selected_techniques[:2]
    
    # Generate motivational message based on risk level
    if risk_level == 'CRITICAL':
        messages = [
            "You're going through a really hard time right now, and that's valid. You deserve support. If you're in crisis, please reach out to someone you trust.",
            "This pain is real and intense. Your suffering matters. Take one small step today—even resting counts.",
            "You're fighting hard, even if it doesn't feel like it. Crisis passes. You have gotten through 100% of your worst days so far."
        ]
    elif risk_level == 'HIGH':
        messages = [
            "Things feel overwhelming right now. You're stronger than this moment. Let's take it one step at a time.",
            "Your struggle is real. You don't have to be fine. But you can get through today.",
            "I see how much you're struggling. You're still here, still trying. That takes courage."
        ]
    elif risk_level == 'MODERATE':
        messages = [
            "You're having a harder day, but you're managing it. Small steps in the right direction still count.",
            "It's okay to not be okay today. You're doing the best you can under these circumstances.",
            "Things are challenging right now, but you have what it takes to get through this."
        ]
    else:  # LOW
        messages = [
            "You seem to be doing okay today. Keep nurturing what's working for you.",
            "You're in a better place right now. Let's keep building on this momentum.",
            "Great to see you taking care of yourself. Keep up the good work."
        ]
    
    motivational_message = np.random.choice(messages)
    
    return {
        'motivational_message': motivational_message,
        'coping_steps': selected_techniques
    }


def calculate_helpfulness(context):
    """Score how well-matched a recommendation is to the context (0-1)"""
    risk_level = context['risk_level']
    factors = context['top_factors']
    
    # Higher risk + more specific factors = more helpful
    risk_score = {
        'CRITICAL': 0.9,
        'HIGH': 0.8,
        'MODERATE': 0.6,
        'LOW': 0.4
    }
    
    factor_count = len(factors.split(','))
    factor_bonus = min(0.2, factor_count * 0.1)
    
    score = risk_score.get(risk_level, 0.5) + factor_bonus
    return min(1.0, score)


# ============================================================================
# MAIN: Generate all 3 schemas
# ============================================================================
def main():
    print("=" * 80)
    print("GENERATING TRAINING DATASETS FOR ARIMA + LoRA")
    print("=" * 80)
    
    # Schema 1: Risk Time Series
    print("\n[1/3] Generating Risk Time Series (30 users × 90 days)...")
    risk_df = generate_risk_timeseries(num_users=30, days=90)
    risk_file = DATA_DIR / "risk_timeseries.csv"
    risk_df.to_csv(risk_file, index=False)
    print(f"✓ Saved: {risk_file}")
    print(f"  Shape: {risk_df.shape}")
    print(f"  Sample:\n{risk_df.head()}\n")
    
    # Schema 2: Check-in Context
    print("[2/3] Generating Check-in Context (2,700 records)...")
    context_df = generate_checkin_context(risk_df)
    context_file = DATA_DIR / "checkin_context.csv"
    context_df.to_csv(context_file, index=False)
    print(f"✓ Saved: {context_file}")
    print(f"  Shape: {context_df.shape}")
    print(f"  Sample:\n{context_df.head()}\n")
    
    # Schema 3: Recommendation Training Pairs
    print("[3/3] Generating Recommendation Training Pairs (120 samples)...")
    training_df = generate_recommendation_pairs(context_df, num_samples=120)
    training_file = DATA_DIR / "recommendation_pairs.csv"
    training_df.to_csv(training_file, index=False)
    print(f"✓ Saved: {training_file}")
    print(f"  Shape: {training_df.shape}")
    print(f"  Sample:\n{training_df[['user_id', 'date', 'feedback', 'helpfulness_score']].head()}\n")
    
    # Summary statistics
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✓ Risk Time Series: {len(risk_df)} records (30 users × 90 days)")
    print(f"✓ Check-in Context: {len(context_df)} records")
    print(f"✓ Recommendation Pairs: {len(training_df)} training examples")
    print(f"\nRisk Distribution:")
    print(risk_df['risk_level'].value_counts())
    print(f"\nUser Types:")
    print(context_df['user_type'].value_counts())
    print(f"\nFeedback Distribution:")
    print(training_df['feedback'].value_counts())
    print("=" * 80)
    print(f"\nAll files saved to: {DATA_DIR}")
    print("\nNext steps:")
    print("1. Use risk_timeseries.csv to train ARIMA model")
    print("2. Use recommendation_pairs.csv to fine-tune LoRA")
    print("3. Use checkin_context.csv for analysis")


if __name__ == "__main__":
    main()

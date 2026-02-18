import json
import os
import sys
from google import genai
from google.genai import types

# Initialize client only if API key is available
api_key = os.environ.get("GEMINI_API_KEY")
print(f"[recommendations.py] GEMINI_API_KEY loaded: {bool(api_key)}", file=sys.stderr)

try:
    client = genai.Client(api_key=api_key) if api_key else None
    if client:
        print(f"[recommendations.py] Gemini client initialized successfully", file=sys.stderr)
    else:
        print(f"[recommendations.py] WARNING: No API key found, Gemini client will be None", file=sys.stderr)
except Exception as e:
    print(f"[recommendations.py] ERROR initializing Gemini client: {str(e)}", file=sys.stderr)
    client = None


def build_prompt(data: dict) -> str:
    risk_level                 = data.get("risk_level", "UNKNOWN")
    trend                      = data.get("trend", "unknown")
    top_factors                = data.get("top_factors", [])
    days_since_checkin         = data.get("days_since_checkin", 0)
    consecutive_high_risk_days = data.get("consecutive_high_risk_days", 0)

    factors_text = ", ".join(top_factors) if top_factors else "no specific factors flagged"

    streak_context = ""
    if consecutive_high_risk_days >= 3:
        streak_context = f"They have been in a high-risk zone for {consecutive_high_risk_days} consecutive days — this is a persistent pattern, not a one-off."
    elif consecutive_high_risk_days >= 2:
        streak_context = "This is their second consecutive high-risk day."

    checkin_context = ""
    if days_since_checkin >= 3:
        checkin_context = f"They haven't checked in for {days_since_checkin} days and just returned."
    elif days_since_checkin > 0:
        checkin_context = f"They missed {days_since_checkin} day(s) before this check-in."

    return f"""You are a warm, compassionate mental wellness companion inside a mental health app called SoulSync.

A user has just completed their mental health check-in. Here is their current state:
- Risk Level: {risk_level}
- Trend: {trend}
- Key Factors: {factors_text}
{f"- {streak_context}" if streak_context else ""}
{f"- {checkin_context}" if checkin_context else ""}

Your job is to respond with exactly two things:

1. A MOTIVATIONAL MESSAGE (2–3 sentences, warm and personal):
   - CRITICAL/HIGH risk: Be deeply compassionate. Acknowledge their struggle directly and genuinely.
     Do NOT be dismissive or falsely cheerful. Remind them their feelings are valid and they are not alone.
     If it's a streak of high-risk days, acknowledge that it's been a hard stretch.
   - MODERATE risk: Be encouraging. Acknowledge the effort it takes to keep checking in.
   - LOW risk: Be warm and affirming. Celebrate their consistency and wellbeing.
   - If they returned after missing days: acknowledge the courage it took to come back.

2. TWO COPING STEPS (specific and achievable today, not generic advice):
   - Tailor each step directly to their flagged factors.
   - Depression factor → behavioural activation (one small meaningful action, not just "go for a walk")
   - Anxiety factor → a specific grounding or breathing technique with brief instructions
   - Stress factor → a specific regulation technique (name it, e.g. "box breathing", "5-4-3-2-1")
   - Sleep factor → one concrete sleep hygiene action for tonight specifically
   - If multiple factors, pick the two most actionable combinations.
   - Steps must be doable in under 30 minutes.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text, no code fences):
{{
  "motivational_message": "...",
  "coping_steps": ["step 1 with specific detail", "step 2 with specific detail"]
}}"""


def get_recommendations(data: dict) -> dict:
    if not client:
        raise ValueError("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.")
    
    prompt = build_prompt(data)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=600,
        ),
    )

    raw = response.text.strip()

    # Strip markdown fences if Gemini adds them
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(
            line for line in lines
            if not line.strip().startswith("```")
        ).strip()

    return json.loads(raw)
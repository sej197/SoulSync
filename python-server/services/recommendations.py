import json
import os
import sys
import groq


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    print(f"[recommendations.py] GROQ_API_KEY loaded: {bool(api_key)}", file=sys.stderr)
    if not api_key:
        raise ValueError("GROQ API key not configured. Please set GROQ_API_KEY environment variable.")
    try:
        client = groq.Groq(api_key=api_key)
        print(f"[recommendations.py] GROQ client initialized successfully", file=sys.stderr)
        return client
    except Exception as e:
        print(f"[recommendations.py] ERROR initializing GROQ client: {str(e)}", file=sys.stderr)
        raise ValueError(f"Failed to initialize GROQ client: {str(e)}")


def build_prompt(data: dict) -> str:
    risk_level                 = data.get("risk_level", "UNKNOWN")
    trend                      = data.get("trend", "unknown")
    top_factors                = data.get("top_factors", [])
    days_since_checkin         = data.get("days_since_checkin", 0)
    consecutive_high_risk_days = data.get("consecutive_high_risk_days", 0)

    context_parts = []

    if risk_level in ("CRITICAL", "HIGH"):
        if consecutive_high_risk_days >= 3:
            context_parts.append(f"This person has been in a high-risk state for {consecutive_high_risk_days} consecutive days.")
        elif consecutive_high_risk_days == 2:
            context_parts.append("This is their second high-risk day in a row.")
        else:
            context_parts.append("They are having a very difficult day.")
    elif risk_level == "MODERATE":
        context_parts.append("They're having a moderately hard day.")
    else:
        context_parts.append("They're doing relatively okay today.")

    trend_map = {
        "improving": "Things have been gradually improving.",
        "worsening": "Their overall state has been declining recently.",
        "stable": "Their state has been consistent lately.",
    }
    if trend in trend_map:
        context_parts.append(trend_map[trend])

    if days_since_checkin >= 3:
        context_parts.append(f"They were gone for {days_since_checkin} days and just came back.")
    elif days_since_checkin > 0:
        context_parts.append(f"They missed {days_since_checkin} day(s) but showed up today.")

    factors_text = ", ".join(top_factors) if top_factors else "general low mood"
    context = " ".join(context_parts)

    return f"""You are a compassionate mental wellness companion in an app called SoulSync.

A user just completed their daily check-in. Here is their situation:
{context}
Their main struggles today: {factors_text}

Write a response with two parts:

1. MOTIVATIONAL MESSAGE (2-3 sentences)
- Speak to them directly and warmly
- Emotionally match their situation — don't be cheerful if they're suffering
- If HIGH/CRITICAL risk, acknowledge the pain honestly before any hope
- If they returned after missing days, recognise that coming back took courage
- Every response must feel fresh — vary your tone, opening, and phrasing

2. TWO COPING STEPS grounded in CBT (Cognitive Behavioural Therapy)
- Use CBT techniques appropriate to their struggles: cognitive restructuring for negative thoughts, behavioural activation for depression, grounding techniques for anxiety, sleep hygiene for sleep issues, etc.
- Directly address their specific struggles: {factors_text}
- Each step must be concrete and doable within 30 minutes
- Name the technique (e.g. box breathing, thought record, behavioural activation) and give just enough instruction to actually do it
- Do NOT give generic advice like "talk to someone" or "take a walk"
- Every response must suggest different techniques — never repeat the same ones

Reply ONLY in this JSON format, no markdown, no extra text:
{{
  "motivational_message": "...",
  "coping_steps": ["step 1", "step 2"]
}}"""


def get_recommendations(data: dict) -> dict:
    client = get_client()
    prompt = build_prompt(data)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(line for line in lines if not line.strip().startswith("```")).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM returned invalid JSON: {e}\nRaw: {raw}")
    client = get_client()

    prompt = build_prompt(data)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=500,  # increase this, 250 was too low
        )
    )

    raw = response.text.strip()

    # Strip markdown fences if Gemini adds them
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(
            line for line in lines
            if not line.strip().startswith("```")
        ).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"[recommendations.py] JSON parse error: {e}\nRaw response: {raw}", file=sys.stderr)
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw response: {raw}")
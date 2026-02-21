from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
import sys

router = APIRouter()


class CategoryScores(BaseModel):
    sleepScore: float = 0.0
    anxietyScore: float = 0.0
    stressScore: float = 0.0
    depressionScore: float = 0.0


class AdaptiveQuizRequest(BaseModel):
    category_scores: CategoryScores
    base_questions: List[Dict]  # The full default daily quiz questions


# Score threshold — above this, we generate detailed questions via LLM
HIGH_THRESHOLD = 0.5

# How many detailed questions to generate per category
DETAILED_QUESTION_COUNT = 5

# Category display info for prompts / logging
CATEGORY_META = {
    "sleep": {
        "scoreField": "sleepScore",
        "emoji": "🌙",
        "label": "Sleep",
        "specialist": "clinical sleep specialist",
        "focus_areas": [
            "Sleep onset latency (time to fall asleep)",
            "Sleep maintenance (night wakings)",
            "Sleep environment factors",
            "Pre-sleep habits and routines",
            "Impact of sleep on next-day functioning",
            "Possible sleep hygiene issues specific to their severity level",
        ],
    },
    "anxiety": {
        "scoreField": "anxietyScore",
        "emoji": "😰",
        "label": "Anxiety",
        "specialist": "clinical anxiety and CBT specialist",
        "focus_areas": [
            "Frequency and intensity of worry episodes",
            "Physical symptoms of anxiety (heart racing, sweating, tension)",
            "Avoidance behaviours and safety-seeking actions",
            "Impact on concentration and decision-making",
            "Social anxiety triggers and situations",
            "Catastrophic thinking patterns",
        ],
    },
    "stress": {
        "scoreField": "stressScore",
        "emoji": "🔥",
        "label": "Stress",
        "specialist": "stress management and occupational health specialist",
        "focus_areas": [
            "Primary sources of current stress (work, relationships, finances)",
            "Coping mechanisms currently used (healthy vs. unhealthy)",
            "Physical manifestations (headaches, muscle tension, fatigue)",
            "Impact on daily responsibilities and productivity",
            "Perceived control over stressors",
            "Recovery and relaxation capacity",
        ],
    },
    "depression": {
        "scoreField": "depressionScore",
        "emoji": "🌧️",
        "label": "Depression",
        "specialist": "clinical psychologist specialising in mood disorders",
        "focus_areas": [
            "Motivation and energy levels throughout the day",
            "Interest and pleasure in previously enjoyed activities",
            "Self-worth and self-esteem patterns",
            "Social withdrawal or isolation tendencies",
            "Changes in appetite or eating habits",
            "Hopelessness and outlook on the future",
        ],
    },
}


# ---------------------------------------------------------------------------
# Generic prompt builder — works for any category
# ---------------------------------------------------------------------------

def _build_category_prompt(category: str, score: float) -> str:
    meta = CATEGORY_META[category]
    severity = "moderate"
    if score >= 0.75:
        severity = "severe"
    elif score >= 0.6:
        severity = "significant"

    focus_list = "\n".join(f"- {f}" for f in meta["focus_areas"])

    return f"""You are a {meta['specialist']} creating a daily check-in questionnaire for a mental health app called SoulSync.

The user's recent {category} score is {score:.2f} out of 1.0 (higher = worse), indicating {severity} {category} difficulties.

Generate exactly {DETAILED_QUESTION_COUNT} targeted {category} assessment questions to understand their issues in depth.
Focus on:
{focus_list}

Each question must be a single_choice type with exactly 5 options, ordered from best (healthiest) to worst.
The options should be specific and clinically meaningful — NOT generic "Never/Sometimes/Always".

Reply ONLY in this JSON array format, no markdown, no extra text:
[
  {{
    "category": "{category}",
    "type": "single_choice",
    "question": "...",
    "options": ["best option", "good option", "moderate option", "poor option", "worst option"]
  }}
]"""


# ---------------------------------------------------------------------------
# LLM response parser
# ---------------------------------------------------------------------------

def _parse_llm_response(raw: str, category: str) -> List[Dict]:
    """Parse and validate the LLM response into quiz questions."""
    # Strip markdown fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(line for line in lines if not line.strip().startswith("```")).strip()

    questions = json.loads(raw)

    validated = []
    for q in questions[:DETAILED_QUESTION_COUNT]:
        if "question" in q and "options" in q and len(q["options"]) >= 3:
            validated.append({
                "category": category,
                "type": "single_choice",
                "question": q["question"],
                "options": q["options"][:5],
                "is_adaptive": True,
            })
    return validated


# ---------------------------------------------------------------------------
# LLM providers
# ---------------------------------------------------------------------------

def _generate_via_groq(prompt: str) -> str:
    """Generate using Groq (Llama)."""
    import groq
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    client = groq.Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1200,
    )
    return response.choices[0].message.content.strip()


def _generate_via_gemini(prompt: str) -> str:
    """Generate using Google Gemini."""
    from google import genai
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text.strip()


# ---------------------------------------------------------------------------
# Generic question generator (works for any category)
# ---------------------------------------------------------------------------

def generate_detailed_questions(category: str, score: float) -> List[Dict]:
    """Use LLM to generate detailed, personalised assessment questions for any category.
    Tries Groq first, falls back to Gemini, then to hardcoded fallback."""

    prompt = _build_category_prompt(category, score)

    # Try Groq first, then Gemini
    for name, generator in [("Groq", _generate_via_groq), ("Gemini", _generate_via_gemini)]:
        try:
            raw = generator(prompt)
            validated = _parse_llm_response(raw, category)
            if len(validated) >= 3:
                print(f"[adaptive_quiz] Generated {len(validated)} {category} questions via {name}", file=sys.stderr)
                return validated
            print(f"[adaptive_quiz] {name} returned only {len(validated)} valid {category} questions", file=sys.stderr)
        except Exception as e:
            print(f"[adaptive_quiz] {name} error for {category}: {e}", file=sys.stderr)

    print(f"[adaptive_quiz] All LLM providers failed for {category}, using fallback questions", file=sys.stderr)
    return get_fallback_questions(category)


# ---------------------------------------------------------------------------
# Fallback questions per category
# ---------------------------------------------------------------------------

def get_fallback_questions(category: str) -> List[Dict]:
    """Return hardcoded fallback questions when LLM is unavailable."""
    fallbacks = _FALLBACK_QUESTIONS.get(category, [])
    return fallbacks


_FALLBACK_QUESTIONS: Dict[str, List[Dict]] = {
    # ---- SLEEP ----
    "sleep": [
        {
            "category": "sleep",
            "type": "single_choice",
            "question": "How long did it take you to fall asleep last night?",
            "options": [
                "Less than 10 minutes",
                "10–20 minutes",
                "20–40 minutes",
                "40–60 minutes",
                "Over an hour",
            ],
            "is_adaptive": True,
        },
        {
            "category": "sleep",
            "type": "single_choice",
            "question": "How many times did you wake up during the night?",
            "options": [
                "Did not wake up",
                "Once briefly",
                "2–3 times",
                "4–5 times",
                "Constantly waking up",
            ],
            "is_adaptive": True,
        },
        {
            "category": "sleep",
            "type": "single_choice",
            "question": "Did you use any screens (phone, TV, laptop) within 30 minutes of trying to sleep?",
            "options": [
                "No screens at all",
                "Brief glance only",
                "About 15 minutes",
                "About 30 minutes",
                "Over 30 minutes of screen time",
            ],
            "is_adaptive": True,
        },
        {
            "category": "sleep",
            "type": "single_choice",
            "question": "How would you rate the quality of your sleep environment (darkness, noise, temperature)?",
            "options": [
                "Excellent — dark, quiet, comfortable",
                "Good — mostly comfortable",
                "Fair — some disturbances",
                "Poor — multiple issues",
                "Very poor — major disruptions",
            ],
            "is_adaptive": True,
        },
        {
            "category": "sleep",
            "type": "single_choice",
            "question": "How much did poor sleep affect your ability to function today?",
            "options": [
                "Not at all",
                "Slightly — minor impact",
                "Moderately — noticeable difficulties",
                "Significantly — struggled through the day",
                "Severely — could barely function",
            ],
            "is_adaptive": True,
        },
    ],
    # ---- ANXIETY ----
    "anxiety": [
        {
            "category": "anxiety",
            "type": "single_choice",
            "question": "How often did you experience racing or uncontrollable thoughts today?",
            "options": [
                "Not at all",
                "Once or twice briefly",
                "Several short episodes",
                "Frequently throughout the day",
                "Almost constantly",
            ],
            "is_adaptive": True,
        },
        {
            "category": "anxiety",
            "type": "single_choice",
            "question": "Did you notice any physical symptoms of anxiety today (e.g. racing heart, sweating, tight chest)?",
            "options": [
                "No physical symptoms",
                "Very mild, barely noticeable",
                "Moderate — noticeable but manageable",
                "Strong — interfered with activities",
                "Intense — felt overwhelming",
            ],
            "is_adaptive": True,
        },
        {
            "category": "anxiety",
            "type": "single_choice",
            "question": "Did you avoid any situations, places, or tasks because of anxiety?",
            "options": [
                "Did not avoid anything",
                "Avoided one minor thing",
                "Avoided a few situations",
                "Avoided several important tasks",
                "Avoided most of my planned activities",
            ],
            "is_adaptive": True,
        },
        {
            "category": "anxiety",
            "type": "single_choice",
            "question": "How well were you able to concentrate on tasks today?",
            "options": [
                "Fully focused with no trouble",
                "Mostly focused with brief distractions",
                "Moderate difficulty concentrating",
                "Significant difficulty — kept losing focus",
                "Could barely concentrate at all",
            ],
            "is_adaptive": True,
        },
        {
            "category": "anxiety",
            "type": "single_choice",
            "question": "Did you find yourself imagining worst-case scenarios today?",
            "options": [
                "Not at all",
                "Once, and dismissed it quickly",
                "A few times, but managed to redirect",
                "Frequently — hard to stop",
                "Constantly — felt consumed by catastrophic thoughts",
            ],
            "is_adaptive": True,
        },
    ],
    # ---- STRESS ----
    "stress": [
        {
            "category": "stress",
            "type": "single_choice",
            "question": "How overwhelmed did you feel by your responsibilities today?",
            "options": [
                "Not at all — everything felt manageable",
                "Slightly — one or two things felt heavy",
                "Moderately — several things piling up",
                "Very — felt like I couldn't keep up",
                "Completely overwhelmed — felt paralysed",
            ],
            "is_adaptive": True,
        },
        {
            "category": "stress",
            "type": "single_choice",
            "question": "Did you experience any physical tension or pain related to stress (headaches, tight shoulders, jaw clenching)?",
            "options": [
                "No physical tension at all",
                "Mild tension, resolved on its own",
                "Moderate tension, needed to consciously relax",
                "Significant tension throughout the day",
                "Severe pain or tension that limited activities",
            ],
            "is_adaptive": True,
        },
        {
            "category": "stress",
            "type": "single_choice",
            "question": "How effectively did you cope with stressful moments today?",
            "options": [
                "Used healthy coping strategies successfully",
                "Mostly coped well with minor slip-ups",
                "Mixed — some healthy, some unhealthy coping",
                "Mostly relied on unhealthy coping (overeating, scrolling, etc.)",
                "Did not cope — felt unable to handle stress",
            ],
            "is_adaptive": True,
        },
        {
            "category": "stress",
            "type": "single_choice",
            "question": "How much control did you feel over the things causing you stress?",
            "options": [
                "Fully in control",
                "Mostly in control",
                "Somewhat in control",
                "Mostly out of control",
                "Completely helpless",
            ],
            "is_adaptive": True,
        },
        {
            "category": "stress",
            "type": "single_choice",
            "question": "Were you able to take any breaks or time for recovery today?",
            "options": [
                "Yes — took proper breaks and felt refreshed",
                "A few short breaks that helped somewhat",
                "Tried to take breaks but couldn't fully relax",
                "Barely any breaks — kept pushing through",
                "No recovery time at all — non-stop pressure",
            ],
            "is_adaptive": True,
        },
    ],
    # ---- DEPRESSION ----
    "depression": [
        {
            "category": "depression",
            "type": "single_choice",
            "question": "How would you describe your energy and motivation levels today?",
            "options": [
                "High energy and motivated",
                "Mostly energised with some dips",
                "Low energy — had to push myself",
                "Very low — basic tasks felt exhausting",
                "No energy — could barely get out of bed",
            ],
            "is_adaptive": True,
        },
        {
            "category": "depression",
            "type": "single_choice",
            "question": "How much interest or pleasure did you find in activities you normally enjoy?",
            "options": [
                "Fully engaged and enjoyed them",
                "Mostly enjoyed them",
                "Some interest, but felt flat",
                "Very little interest — went through the motions",
                "No interest or pleasure at all",
            ],
            "is_adaptive": True,
        },
        {
            "category": "depression",
            "type": "single_choice",
            "question": "How did you feel about yourself and your self-worth today?",
            "options": [
                "Felt good about myself",
                "Mostly positive with occasional doubts",
                "Neutral — neither good nor bad",
                "Quite critical and negative about myself",
                "Felt worthless or like a burden",
            ],
            "is_adaptive": True,
        },
        {
            "category": "depression",
            "type": "single_choice",
            "question": "Did you withdraw from social interactions or isolate yourself today?",
            "options": [
                "Actively sought and enjoyed social contact",
                "Had some positive interactions",
                "Avoided some social situations",
                "Mostly kept to myself, even when opportunities arose",
                "Completely withdrew — no social contact",
            ],
            "is_adaptive": True,
        },
        {
            "category": "depression",
            "type": "single_choice",
            "question": "How hopeful do you feel about tomorrow and the near future?",
            "options": [
                "Very hopeful and looking forward",
                "Cautiously optimistic",
                "Neutral — not hopeful but not hopeless",
                "Mostly pessimistic about things improving",
                "Feel like nothing will get better",
            ],
            "is_adaptive": True,
        },
    ],
}


# ---------------------------------------------------------------------------
# Canonical insertion order — where adapted questions appear in the quiz
# ---------------------------------------------------------------------------
# In the default quiz the categories appear as: anxiety → sleep → stress → depression → reflection
# We preserve this order so the quiz feels natural.
_CATEGORY_ORDER = ["anxiety", "sleep", "stress", "depression"]


@router.post("/adaptive-quiz")
async def get_adaptive_quiz(body: AdaptiveQuizRequest):
    """
    Returns an adaptive daily quiz. For every category whose score >= HIGH_THRESHOLD,
    replaces the default questions of that category with LLM-generated detailed ones.
    Categories below the threshold retain their original questions.

    Request:
    {
        "category_scores": { "sleepScore": 0.7, "anxietyScore": 0.8, ... },
        "base_questions": [ ...default daily quiz questions... ]
    }

    Response:
    {
        "questions": [...adapted questions...],
        "adaptations": {
            "sleep": { "adapted": true, "reason": "...", "score": 0.7 },
            "anxiety": { "adapted": true, "reason": "...", "score": 0.8 },
            ...
        }
    }
    """
    try:
        scores = body.category_scores
        base_questions = body.base_questions
        adaptations: Dict[str, Dict] = {}

        # Map category name -> its score value
        score_map = {
            "sleep": scores.sleepScore,
            "anxiety": scores.anxietyScore,
            "stress": scores.stressScore,
            "depression": scores.depressionScore,
        }

        # Determine which categories need adaptation
        categories_to_adapt = [
            cat for cat in _CATEGORY_ORDER if score_map[cat] >= HIGH_THRESHOLD
        ]

        if not categories_to_adapt:
            # Nothing to adapt — return base quiz as-is
            for cat in _CATEGORY_ORDER:
                adaptations[cat] = {
                    "adapted": False,
                    "reason": f"{CATEGORY_META[cat]['label']} score within normal range.",
                    "score": score_map[cat],
                }
            return {
                "questions": base_questions,
                "adaptations": adaptations,
            }

        # Set of categories being replaced
        adapted_categories_set = set(categories_to_adapt)

        # Generate detailed questions for each elevated category
        generated_by_category: Dict[str, List[Dict]] = {}
        for cat in categories_to_adapt:
            detailed = generate_detailed_questions(cat, score_map[cat])
            generated_by_category[cat] = detailed
            adaptations[cat] = {
                "adapted": True,
                "reason": f"{CATEGORY_META[cat]['label']} score elevated ({score_map[cat]:.2f}). Showing detailed {cat} assessment.",
                "score": score_map[cat],
                "questions_replaced": len(detailed),
            }
            print(
                f"[adaptive_quiz] {cat} adapted: score={score_map[cat]}, generated {len(detailed)} questions",
                file=sys.stderr,
            )

        # Mark non-adapted categories
        for cat in _CATEGORY_ORDER:
            if cat not in adaptations:
                adaptations[cat] = {
                    "adapted": False,
                    "reason": f"{CATEGORY_META[cat]['label']} score within normal range.",
                    "score": score_map[cat],
                }

        # Rebuild the quiz in the correct category order
        # Walk original base_questions to preserve order, replacing adapted categories
        rebuilt: List[Dict] = []
        seen_categories: set = set()

        for q in base_questions:
            cat = q.get("category")

            if cat in adapted_categories_set:
                # Insert LLM-generated questions in place of the FIRST occurrence of this category
                if cat not in seen_categories:
                    rebuilt.extend(generated_by_category[cat])
                    seen_categories.add(cat)
                # Skip all original questions for this category
                continue
            else:
                rebuilt.append(q)

        # Re-number all questions sequentially
        for i, q in enumerate(rebuilt):
            q["id"] = i + 1

        return {
            "questions": rebuilt,
            "adaptations": adaptations,
        }

    except Exception as e:
        print(f"[adaptive_quiz] Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        # On any error, return base questions unchanged
        return {
            "questions": body.base_questions,
            "adaptations": {
                cat: {"adapted": False, "reason": f"Error: {str(e)}", "score": 0}
                for cat in _CATEGORY_ORDER
            },
        }

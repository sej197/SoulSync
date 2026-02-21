from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
import sys
import hashlib
from datetime import date

router = APIRouter()

# ---------------------------------------------------------------------------
# Load the full question pool from data/all_quiz.json at startup
# ---------------------------------------------------------------------------
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

def _load_json(filename: str) -> dict:
    path = os.path.join(_DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        # Strip JS-style comments (the JSON files start with //)
        lines = content.split("\n")
        clean = "\n".join(l for l in lines if not l.strip().startswith("//"))
        return json.loads(clean)

_ALL_QUIZ = _load_json("all_quiz.json")
_DAILY_QUIZ = _load_json("dailyCheckinQuiz.json")

# Build the pool: questions from all_quiz that are NOT in the default daily set
_DAILY_IDS = {q["id"] for q in _DAILY_QUIZ["questions"]}

# Index the extra pool by category (exclude daily base + trivia/knowledge questions)
_POOL_BY_CATEGORY: Dict[str, List[Dict]] = {}
for q in _ALL_QUIZ["questions"]:
    if q["id"] in _DAILY_IDS:
        continue
    cat = q.get("category", "")
    if cat not in ("anxiety", "sleep", "stress", "depression"):
        continue
    # Skip trivia/knowledge questions (options starting with "A.", "B." etc.)
    opts = q.get("options", [])
    if opts and any(str(o).startswith(("A.", "B.", "C.", "D.", "E.", "F.", "G.")) for o in opts):
        continue
    _POOL_BY_CATEGORY.setdefault(cat, []).append(q)

for cat, qs in _POOL_BY_CATEGORY.items():
    print(f"[adaptive_quiz] Pool loaded: {cat} = {len(qs)} extra questions", file=sys.stderr)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class CategoryScores(BaseModel):
    sleepScore: float = 0.0
    anxietyScore: float = 0.0
    stressScore: float = 0.0
    depressionScore: float = 0.0


class AdaptiveQuizRequest(BaseModel):
    category_scores: CategoryScores
    base_questions: List[Dict]
    user_id: str = ""           # used for per-user seed
    today: str = ""             # YYYY-MM-DD — for daily rotation


# Score threshold — above this, we swap in follow-up questions
HIGH_THRESHOLD = 0.5

# How many follow-up questions per elevated category
FOLLOWUP_COUNT = 5

# Category order in the quiz
_CATEGORY_ORDER = ["anxiety", "sleep", "stress", "depression"]

CATEGORY_META = {
    "anxiety": {"emoji": "😰", "label": "Anxiety"},
    "sleep":   {"emoji": "🌙", "label": "Sleep"},
    "stress":  {"emoji": "🔥", "label": "Stress"},
    "depression": {"emoji": "🌧️", "label": "Depression"},
}


# ---------------------------------------------------------------------------
# Date-seeded question picker — different questions every day
# ---------------------------------------------------------------------------

def _pick_questions(category: str, count: int, user_id: str, today: str) -> List[Dict]:
    """Pick `count` questions from the pool for `category`, rotated daily per user."""
    pool = _POOL_BY_CATEGORY.get(category, [])
    if not pool:
        return []

    # Create a deterministic seed from user_id + date so same user gets
    # different questions each day, but the quiz is stable within a day
    seed_str = f"{user_id}:{today}:{category}"
    seed = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)

    # Shuffle indices deterministically
    indices = list(range(len(pool)))
    # Simple Fisher-Yates with our seed
    import random
    rng = random.Random(seed)
    rng.shuffle(indices)

    picked = []
    for idx in indices[:count]:
        q = dict(pool[idx])  # shallow copy
        q["is_adaptive"] = True
        picked.append(q)

    return picked


# ---------------------------------------------------------------------------
# LLM fallback (only used when the pool has fewer questions than needed)
# ---------------------------------------------------------------------------

def _build_category_prompt(category: str, score: float) -> str:
    severity = "moderate"
    if score >= 0.75:
        severity = "severe"
    elif score >= 0.6:
        severity = "significant"

    focus_map = {
        "sleep": "sleep onset, night wakings, sleep environment, pre-sleep habits, next-day impact, sleep hygiene",
        "anxiety": "worry frequency, physical symptoms, avoidance, concentration, catastrophic thinking, social anxiety",
        "stress": "stress sources, coping mechanisms, physical tension, productivity impact, perceived control, recovery",
        "depression": "motivation/energy, anhedonia, self-worth, social withdrawal, appetite changes, hopelessness",
    }

    return f"""You are a clinical specialist creating a daily check-in for a mental health app called SoulSync.
The user's {category} score is {score:.2f}/1.0 ({severity}).
Generate exactly {FOLLOWUP_COUNT} targeted {category} questions.
Focus on: {focus_map.get(category, category)}

Each question: single_choice, exactly 5 options ordered best→worst, clinically specific (NOT generic Never/Sometimes/Always).

Reply ONLY as a JSON array:
[{{"category":"{category}","type":"single_choice","question":"...","options":["best","good","moderate","poor","worst"]}}]"""


def _generate_via_gemini(prompt: str) -> str:
    from google import genai
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")
    client = genai.Client(api_key=api_key)
    resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    return resp.text.strip()


def _generate_via_groq(prompt: str) -> str:
    import groq
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    client = groq.Groq(api_key=api_key)
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7, max_tokens=1200,
    )
    return resp.choices[0].message.content.strip()


def _parse_llm_response(raw: str, category: str) -> List[Dict]:
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(l for l in lines if not l.strip().startswith("```")).strip()
    questions = json.loads(raw)
    validated = []
    for q in questions[:FOLLOWUP_COUNT]:
        if "question" in q and "options" in q and len(q["options"]) >= 3:
            validated.append({
                "category": category, "type": "single_choice",
                "question": q["question"], "options": q["options"][:5],
                "is_adaptive": True,
            })
    return validated


def _llm_generate(category: str, score: float) -> List[Dict]:
    prompt = _build_category_prompt(category, score)
    for name, gen in [("Groq", _generate_via_groq), ("Gemini", _generate_via_gemini)]:
        try:
            raw = gen(prompt)
            validated = _parse_llm_response(raw, category)
            if len(validated) >= 3:
                print(f"[adaptive_quiz] LLM ({name}) generated {len(validated)} {category} Qs", file=sys.stderr)
                return validated
        except Exception as e:
            print(f"[adaptive_quiz] LLM {name} error for {category}: {e}", file=sys.stderr)
    return []


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@router.post("/adaptive-quiz")
async def get_adaptive_quiz(body: AdaptiveQuizRequest):
    """
    Build an adaptive daily quiz:
    1. For each category whose yesterday-score >= 0.5, replace the 3 default
       questions with 5 follow-up questions picked FROM all_quiz.json (rotated
       daily so the user sees different questions each day).
    2. If the pool doesn't have enough questions, top up with LLM-generated ones.
    3. Non-elevated categories keep their default questions.
    4. Reflection paragraph question always stays.
    """
    try:
        scores = body.category_scores
        today = body.today or date.today().isoformat()
        user_id = body.user_id or "default"

        score_map = {
            "sleep": scores.sleepScore,
            "anxiety": scores.anxietyScore,
            "stress": scores.stressScore,
            "depression": scores.depressionScore,
        }

        categories_to_adapt = [c for c in _CATEGORY_ORDER if score_map[c] >= HIGH_THRESHOLD]
        adaptations: Dict[str, Dict] = {}

        # Build replacement questions for elevated categories
        generated: Dict[str, List[Dict]] = {}
        for cat in categories_to_adapt:
            # 1. Try pool first
            pool_qs = _pick_questions(cat, FOLLOWUP_COUNT, user_id, today)

            # 2. If pool is short, top up with LLM
            if len(pool_qs) < FOLLOWUP_COUNT:
                needed = FOLLOWUP_COUNT - len(pool_qs)
                print(f"[adaptive_quiz] Pool has {len(pool_qs)} {cat} Qs, need {needed} more from LLM", file=sys.stderr)
                llm_qs = _llm_generate(cat, score_map[cat])
                pool_qs.extend(llm_qs[:needed])

            generated[cat] = pool_qs
            adaptations[cat] = {
                "adapted": True,
                "reason": f"{CATEGORY_META[cat]['label']} score elevated ({score_map[cat]:.2f}). Showing detailed follow-up questions.",
                "score": score_map[cat],
                "questions_replaced": len(pool_qs),
                "source": "question_pool",
            }
            print(f"[adaptive_quiz] {cat} adapted: score={score_map[cat]:.2f}, "
                  f"{len(pool_qs)} follow-up Qs (pool={len(_POOL_BY_CATEGORY.get(cat, []))})", file=sys.stderr)

        # Mark non-adapted
        for cat in _CATEGORY_ORDER:
            if cat not in adaptations:
                adaptations[cat] = {
                    "adapted": False,
                    "reason": f"{CATEGORY_META[cat]['label']} score within normal range.",
                    "score": score_map[cat],
                }

        if not categories_to_adapt:
            return {"questions": body.base_questions, "adaptations": adaptations}

        # Rebuild quiz: walk base questions, swap adapted categories
        adapted_set = set(categories_to_adapt)
        rebuilt: List[Dict] = []
        seen: set = set()

        for q in body.base_questions:
            cat = q.get("category")
            if cat in adapted_set:
                if cat not in seen:
                    rebuilt.extend(generated[cat])
                    seen.add(cat)
                # skip original questions for this category
            else:
                rebuilt.append(q)

        # Re-number sequentially
        for i, q in enumerate(rebuilt):
            q["id"] = i + 1

        return {"questions": rebuilt, "adaptations": adaptations}

    except Exception as e:
        print(f"[adaptive_quiz] Error: {e}", file=sys.stderr)
        import traceback; traceback.print_exc(file=sys.stderr)
        return {
            "questions": body.base_questions,
            "adaptations": {c: {"adapted": False, "reason": f"Error: {e}", "score": 0} for c in _CATEGORY_ORDER},
        }

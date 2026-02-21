export const RISK_WEIGHTS = {
  depression_quiz_score: 0.006,
  anxiety_quiz_score: 0.022,
  stress_quiz_score: 0.218,
  sleep_quiz_score: 0.317,
  journal_score: 0.083,
  chatbot_score: 0.137,
  quiz_score: 0.055,
  community_score: 0.115,
  disengagement_score: 0.046
};

export const RISK_LABELS = [
  { key: "depression_quiz_score", label: "Elevated depression", threshold: 0.72 },
  { key: "anxiety_quiz_score", label: "High anxiety", threshold: 0.60 },
  { key: "stress_quiz_score", label: "Severe stress", threshold: 0.70 },
  { key: "sleep_quiz_score", label: "Poor sleep quality", threshold: 0.60 },
  { key: "journal_score", label: "High distress in journal", threshold: 0.70 },
  { key: "chatbot_score", label: "Concerning chat patterns", threshold: 0.65 }
];

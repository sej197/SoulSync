export const RISK_WEIGHTS = {
  depression_quiz_score: 0.4008,
  anxiety_quiz_score: 0.1157,
  stress_quiz_score: 0.0564,
  sleep_quiz_score: 0.0653,
  disengagement_score: 0.0444,
  journal_score: 0.0726,
  chatbot_score: 0.1529,
  quiz_score: 0.0474,
  community_score: 0.0444,
};

export const RISK_LABELS = [
  { key: "depression_quiz_score", label: "Elevated depression", threshold: 0.72 },
  { key: "anxiety_quiz_score", label: "High anxiety", threshold: 0.60 },
  { key: "stress_quiz_score", label: "Severe stress", threshold: 0.70 },
  { key: "sleep_quiz_score", label: "Poor sleep quality", threshold: 0.60 },
  { key: "journal_score", label: "High distress in journal", threshold: 0.70 },
  { key: "chatbot_score", label: "Concerning chat patterns", threshold: 0.65 }
];

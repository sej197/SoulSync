import mongoose from "mongoose";

const riskScoreSchema = new mongoose.Schema({

  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
  },

  depression_quiz_score: { type: Number, default: null },
  depression_quiz_date:  { type: String, default: null },
  anxiety_quiz_score:    { type: Number, default: null },
  anxiety_quiz_date:     { type: String, default: null },
  stress_quiz_score:     { type: Number, default: null },
  stress_quiz_date:      { type: String, default: null },
  sleep_quiz_score:      { type: Number, default: null },
  sleep_quiz_date:       { type: String, default: null },

  journal_score:   { type: Number, default: null },
  quiz_score:      { type: Number, default: null },
  chatbot_score:   { type: Number, default: null },
  community_score: { type: Number, default: null },

  overall_score: { type: Number, default: null },
  risk_level: {
    type: String,
    enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
  },
  top_factors:    [{ type: String }],
  previous_score: { type: Number, default: null },
  trend: {
    type:    String,
    enum:    ["improving", "stable", "declining", "unknown"],
    default: "unknown",
  },

  // Disengagement tracking 
  // Tracks silence between check-ins and feeds into RISK_WEIGHTS
  days_since_checkin:  { type: Number, default: 0 },
  last_checkin_date:   { type: String, default: null },   // last date user actually checked in
  is_imputed:          { type: Boolean, default: false }, // true = nightly job filled this, user didn't check in
  disengagement_score: { type: Number, default: 0 },      // 0–1, computed from silence + last known risk

  // Personal baseline 
  // Rolling 30-day personal average — detects "high for them" even if absolute score looks moderate
  baseline_score:     { type: Number, default: null }, // 30-day mean (real check-ins only)
  baseline_deviation: { type: Number, default: null }, // today - baseline (positive = worse than usual)

  // Velocity reliability 
  // How many real (non-imputed) data points velocity was computed over
  // If < 4, velocity_reliable = false in the response
  velocity_data_points: { type: Number, default: 0 },

  created_at: { type: Date, default: Date.now },

}, {
  indexes: [
    { user: 1, date: 1 },
    { user: 1, created_at: -1 },
  ],
});

// Unique constraint: one risk score per user per day
riskScoreSchema.index({ user: 1, date: 1 }, { unique: true });

// For nightly job query: find users with history but no today entry
riskScoreSchema.index({ date: 1 });

// For consecutive high-risk streak query
riskScoreSchema.index({ user: 1, risk_level: 1, date: -1 });

export default mongoose.model("RiskScore", riskScoreSchema);
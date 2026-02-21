// src/components/insights/Daily.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Siren, TriangleAlert, TrendingDown, Lightbulb, RefreshCw, Eye,
  BarChart3, CircleCheck, Sprout, Info, Pin,
  Target, Leaf, Heart, Waves, Flame,
  Music, Handshake, Pencil, Coffee, CheckSquare, Mail,
  Wind, Box, Smile, Sparkles
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

// ── Risk helpers ──────────────────────────────────────────────────────────
const getRiskLevel = (score) => {
  if (score < 65) return "LOW";
  if (score < 80) return "MODERATE";
  return "HIGH";
};

const getLevelColor = (level) => {
  switch (level) {
    case "LOW":
      return "#10b981";
    case "MODERATE":
      return "#f59e0b";
    case "HIGH":
      return "#ef4444";
    case "CRITICAL":
      return "#991b1b";
    default:
      return "#6b7280";
  }
};

const getRiskBadgeStyle = (level) => {
  switch (level) {
    case "LOW":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "MODERATE":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "HIGH":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

// ── Quiz assessment config ─────────────────────────────────────────────────
const FACTOR_QUIZ_MAP = {
  anxiety: {
    route: "/anxiety-quiz",
    label: "Anxiety Assessment",
    subtitle: "GAD-7 · ~3 min",
    icon: "🧠",
    color: "from-violet-50 to-purple-50 border-violet-200",
    accentColor: "border-l-violet-400",
    btnColor: "bg-violet-600 hover:bg-violet-700",
    encouragement:
      "Understanding your anxiety patterns is the first step to feeling calmer.",
  },
  depression: {
    route: "/depression-quiz",
    label: "Mood Assessment",
    subtitle: "PHQ-9 · ~3 min",
    icon: "💙",
    color: "from-blue-50 to-indigo-50 border-blue-200",
    accentColor: "border-l-blue-400",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    encouragement:
      "Checking in on your mood helps us support you better every day.",
  },
  stress: {
    route: "/stress-quiz",
    label: "Stress Assessment",
    subtitle: "PSS · ~2 min",
    icon: "🌊",
    color: "from-teal-50 to-cyan-50 border-teal-200",
    accentColor: "border-l-teal-400",
    btnColor: "bg-teal-600 hover:bg-teal-700",
    encouragement: "A quick check-in can reveal what's weighing on you most.",
  },
  sleep: {
    route: "/sleep-quiz",
    label: "Sleep Quality Check",
    subtitle: "PSQI · ~3 min",
    icon: "🌙",
    color: "from-indigo-50 to-slate-50 border-indigo-200",
    accentColor: "border-l-indigo-400",
    btnColor: "bg-indigo-600 hover:bg-indigo-700",
    encouragement: "Sleep affects everything — let's see how yours has been.",
  },
};

const parseFactorKey = (factorStr = "") => {
  const lower = factorStr.toLowerCase();
  for (const key of Object.keys(FACTOR_QUIZ_MAP)) {
    if (lower.includes(key)) return key;
  }
  return null;
};

// ── Helpline data ──────────────────────────────────────────────────────────
const HELPLINES = [
  { name: "iCall", number: "9152987821", hours: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
  { name: "AASRA", number: "9820466627", hours: "24/7" },
];

// ── Alert & insight helpers ────────────────────────────────────────────────
const getAlertIcon = (type) => ({ CRITICAL: <Siren size={24} className="text-red-500" />, URGENT: <TriangleAlert size={24} className="text-orange-500" />, WARNING: <TrendingDown size={24} className="text-amber-500" />, EARLY_WARNING: <Lightbulb size={24} className="text-yellow-500" />, RELAPSE_WARNING: <RefreshCw size={24} className="text-purple-500" />, ATTENTION: <Eye size={24} className="text-blue-500" /> }[type] ?? <BarChart3 size={24} className="text-slate-500" />);
const getAlertStyle = (sev) => ({ critical: "bg-red-50 border-red-300", high: "bg-orange-50 border-orange-300", medium: "bg-amber-50 border-amber-300" }[sev] ?? "bg-blue-50 border-blue-300");
const getInsightAccent = (t) => ({
  POSITIVE: { bg: "bg-emerald-50", border: "border-emerald-200", strip: "bg-emerald-400", icon: <CircleCheck size={14} className="text-emerald-500" />, tag: "Positive", tagColor: "text-emerald-600 bg-emerald-50" },
  RECOVERY: { bg: "bg-teal-50", border: "border-teal-200", strip: "bg-teal-400", icon: <Sprout size={14} className="text-teal-500" />, tag: "Recovery", tagColor: "text-teal-600 bg-teal-50" },
  INFO: { bg: "bg-blue-50", border: "border-blue-200", strip: "bg-blue-400", icon: <Info size={14} className="text-blue-500" />, tag: "Info", tagColor: "text-blue-600 bg-blue-50" },
}[t] ?? { bg: "bg-gray-50", border: "border-gray-200", strip: "bg-gray-400", icon: <Pin size={14} className="text-gray-500" />, tag: "Note", tagColor: "text-gray-600 bg-gray-50" });

// ── Recommendation accent colors (cycle through) ──────────────────────────
const REC_ACCENTS = [
  { gradient: "from-purple-500 to-violet-500", lightBg: "hover:bg-purple-50/60", borderHover: "hover:border-purple-200", icon: <Target size={16} className="text-purple-500" /> },
  { gradient: "from-amber-500 to-orange-500", lightBg: "hover:bg-amber-50/60", borderHover: "hover:border-amber-200", icon: <Lightbulb size={16} className="text-amber-500" /> },
  { gradient: "from-teal-500 to-emerald-500", lightBg: "hover:bg-teal-50/60", borderHover: "hover:border-teal-200", icon: <Leaf size={16} className="text-teal-500" /> },
  { gradient: "from-pink-500 to-rose-500", lightBg: "hover:bg-pink-50/60", borderHover: "hover:border-pink-200", icon: <Heart size={16} className="text-pink-500" /> },
  { gradient: "from-blue-500 to-indigo-500", lightBg: "hover:bg-blue-50/60", borderHover: "hover:border-blue-200", icon: <Waves size={16} className="text-blue-500" /> },
  { gradient: "from-orange-500 to-red-400", lightBg: "hover:bg-orange-50/60", borderHover: "hover:border-orange-200", icon: <Flame size={16} className="text-orange-500" /> },
];

// ──────────────────────────────────────────────────────────────────────────
export default function Daily({ dailyData, onRefresh, userId }) {
  const navigate = useNavigate();
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentBreathing, setCurrentBreathing] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [expandedRec, setExpandedRec] = useState(null);
  const [xgboostPrediction, setXgboostPrediction] = useState([]);

  const getWellnessLabel = (score) => {
    if (score <= 2.5)
      return {
        label: "Thriving",
        emoji: "🌟",
        bar: "bg-emerald-400",
        pill: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      };
    if (score <= 4.5)
      return {
        label: "Doing Well",
        emoji: "😊",
        bar: "bg-green-400",
        pill: "bg-green-50 text-green-600 border border-green-200",
      };
    if (score <= 6)
      return {
        label: "Steady",
        emoji: "🌤️",
        bar: "bg-amber-400",
        pill: "bg-amber-50 text-amber-600 border border-amber-200",
      };
    if (score <= 7.5)
      return {
        label: "Needs Care",
        emoji: "🌧️",
        bar: "bg-orange-400",
        pill: "bg-orange-50 text-orange-600 border border-orange-200",
      };
    return {
      label: "Rest Up",
      emoji: "🌩️",
      bar: "bg-red-400",
      pill: "bg-red-50 text-red-600 border border-red-200",
    };
  };

  if (!dailyData) return null;

  const score = dailyData.score ?? 0;
  const riskLevel = getRiskLevel(score);
  const isHighRisk = riskLevel === "HIGH" || riskLevel === "CRITICAL";

  const assessmentCards = (dailyData.top_factors ?? [])
    .map((f) => {
      const key = parseFactorKey(f);
      return key ? { ...FACTOR_QUIZ_MAP[key], factorKey: key } : null;
    })
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((x) => x.route === v.route) === i);

  // ── Static wellness content ──────────────────────────────────────────────
  const funActivities = [
    { title: "Dance Break", description: "Put on your favourite song and dance for 3 minutes", icon: <Music size={20} className="text-pink-500" />, duration: "3 min" },
    { title: "Gratitude List", description: "Write down 3 things you're grateful for today", icon: <Handshake size={20} className="text-amber-500" />, duration: "5 min" },
    { title: "Plant Care", description: "Water a plant or spend 10 minutes in nature", icon: <Leaf size={20} className="text-emerald-500" />, duration: "10 min" },
    { title: "Read & Relax", description: "Read a chapter of a book or an interesting article", icon: <Eye size={20} className="text-indigo-500" />, duration: "15 min" },
    { title: "Doodle Time", description: "Draw freely for 5 minutes without judgment", icon: <Pencil size={20} className="text-slate-500" />, duration: "5 min" },
    { title: "Mindful Tea", description: "Make your favourite drink and enjoy it slowly", icon: <Coffee size={20} className="text-orange-500" />, duration: "10 min" },
    { title: "Small Win", description: "Complete one small task you've been putting off", icon: <CheckSquare size={20} className="text-emerald-500" />, duration: "5 min" },
    { title: "Connect", description: "Send a kind message to someone you care about", icon: <Mail size={20} className="text-rose-500" />, duration: "2 min" },
  ];

  const breathingExercises = [
    { icon: <Waves size={20} className="text-blue-500" />, name: "Ocean Breathing", pattern: "4-4-4", description: "Inhale 4, hold 4, exhale 4", duration: "2 min" },
    { icon: <Box size={20} className="text-teal-500" />, name: "Box Breathing", pattern: "4-4-4-4", description: "Inhale 4, hold 4, exhale 4, hold 4", duration: "3 min" },
    { icon: <Smile size={20} className="text-amber-500" />, name: "4-7-8 Technique", pattern: "4-7-8", description: "Inhale 4, hold 7, exhale 8", duration: "2 min" },
  ];

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    setCurrentActivity(rand(funActivities));
    setCurrentBreathing(rand(breathingExercises));
  }, []);

  useEffect(() => {
    const fetchXGBoost = async () => {
      try {
        // Step 1: Get recent risks from monthlyInsights
        const insightsRes = await fetch(
          `http://localhost:5000/api/risk/monthlyInsights/${userId}`
        );
        const insightsData = await insightsRes.json();

        // Extract last 7 overall scores as recent_risks
        const recentRisks = (insightsData.chart_data ?? [])
          .slice(-7)
          .map((d) => parseFloat(((d.overall / 100) * 10).toFixed(2))); // convert 0-100 → 0-10

        if (recentRisks.length < 3) return;

        // Step 2: Hit recommendations API with recent_risks
        const recRes = await fetch("http://localhost:8000/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            risk_score: dailyData?.score ?? 5,
            risk_level: getRiskLevel(dailyData?.score ?? 50),
            trend: dailyData?.pattern_analysis?.velocity_interpretation?.toLowerCase() ?? "stable",
            top_factors: dailyData?.top_factors ?? [],
            recent_risks: recentRisks,
          }),
        });

        const recData = await recRes.json();

        if (recData.xgboost_prediction) {
          setXgboostPrediction(recData.xgboost_prediction);
        }
      } catch (err) {
        console.error("XGBoost fetch failed:", err);
      }
    };

    if (userId) fetchXGBoost();
  }, [userId]);

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const recommendations = dailyData.recommendations ?? [];


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── ALERTS ───────────────────────────────────────────────────────── */}
      {dailyData.alerts?.length > 0 && (
        <div className="space-y-3">
          {dailyData.alerts.map((alert, i) => (
            <div
              key={i}
              className={`rounded-[2rem] p-6 border-2 flex items-start gap-4 transition-all ${getAlertStyle(alert.severity)}`}
            >
              <span className="text-3xl flex-shrink-0">
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-1 text-lg">
                  {alert.message}
                </h4>
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                  {alert.detail}
                </p>
                {alert.action && (
                  <button className="px-5 py-2.5 bg-white border-2 border-current rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                    {alert.action} <span>→</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TOP ROW: 2 even columns ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── LEFT — Risk Score ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 text-center">
              <h2 className="text-[#7B1FA2] font-bold tracking-wide uppercase text-xs mb-2 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-200">
                {dayName}, {dateStr}
              </h2>
              <h3 className="text-2xl font-serif text-[#4A148C] mb-8 font-bold">
                Daily Wellness Score
              </h3>

              <div className="relative w-64 h-64 mx-auto mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={20}
                    data={[{ value: score, fill: getLevelColor(riskLevel) }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "rgba(0,0,0,0.05)" }}
                      dataKey="value"
                      cornerRadius={30}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-1">
                    {riskLevel === "LOW"
                      ? "😊"
                      : riskLevel === "MODERATE"
                        ? "😐"
                        : "😟"}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold mt-2 uppercase tracking-wide border-2 ${getRiskBadgeStyle(riskLevel)}`}
                  >
                    {riskLevel === "LOW"
                      ? "Doing Well"
                      : riskLevel === "MODERATE"
                        ? "Needs Attention"
                        : "High Risk"}
                  </span>
                </div>
              </div>

              {/* Pattern analysis — compact chips */}
              {dailyData.pattern_analysis && (
                <div className="flex gap-3 justify-center flex-wrap">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAFAFA] border border-gray-100">
                    <span className="text-sm">📈</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Trend
                    </span>
                    <span
                      className={`text-xs font-bold ${dailyData.pattern_analysis.velocity_interpretation === "Improving" ? "text-emerald-600" : dailyData.pattern_analysis.velocity_interpretation === "Worsening" ? "text-red-600" : "text-slate-600"}`}
                    >
                      {dailyData.pattern_analysis.velocity_interpretation}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAFAFA] border border-gray-100">
                    <span className="text-sm">🎭</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Stability
                    </span>
                    <span
                      className={`text-xs font-bold ${dailyData.pattern_analysis.mood_stability === "Stable" ? "text-emerald-600" : dailyData.pattern_analysis.mood_stability === "Moderate" ? "text-amber-600" : "text-red-600"}`}
                    >
                      {dailyData.pattern_analysis.mood_stability}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={onRefresh}
                className="mt-6 w-full py-4 rounded-[2rem] bg-white border border-purple-100 text-slate-600 hover:text-[#7B1FA2] shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 group/btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 group-hover/btn:rotate-180 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Insights
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Assessment + Insights ─────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Assessment nudge — compact horizontal cards */}
          {assessmentCards.length > 0 ? (
            <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-200 to-transparent rounded-br-full opacity-20" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2 bg-purple-100 rounded-xl border border-purple-200 text-lg">
                    🎯
                  </span>
                  <div>
                    <h3 className="text-[#4A148C] font-bold font-serif text-lg leading-tight">
                      We noticed something
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Quick check-ins to personalise your support
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {assessmentCards.map((card, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-r ${card.color} rounded-2xl p-4 border border-l-4 ${card.accentColor} hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {card.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm">
                              {card.label}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {card.subtitle} — {card.encouragement}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(card.route)}
                          className={`flex-shrink-0 px-4 py-2 ${card.btnColor} text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:scale-105 whitespace-nowrap`}
                        >
                          Start →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-[2.5rem] p-8 shadow-lg border border-emerald-100">
              <div className="text-center py-4">
                <span className="text-5xl block mb-3">🌟</span>
                <h3 className="font-bold text-[#4A148C] text-lg mb-2">
                  You're on track!
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  No areas of concern detected today. Keep maintaining your
                  healthy habits.
                </p>
              </div>
            </div>
          )}

          {/* Motivational Message — inline card */}
          {dailyData.motivational_message && (
            <div className="group bg-white rounded-[1.75rem] p-8 shadow-sm hover:shadow-md transition-all duration-500 relative overflow-hidden border border-slate-100">
              {/* Subtle warm glow */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-100/40 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-8 h-0.5 bg-purple-300 mx-auto mb-6 rounded-full" />

                <p className="text-[1.05rem] text-slate-600 leading-8 font-serif italic text-center tracking-wide">
                  {dailyData.motivational_message}
                </p>

                <div className="w-8 h-0.5 bg-purple-300 mx-auto mt-6 rounded-full" />
              </div>
            </div>
          )}

          {/* Helplines */}
          {isHighRisk && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-[2rem] p-6 border-2 border-red-200 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">🤝</span>
                <div>
                  <h4 className="font-bold text-red-800 mb-1">
                    You don't have to face this alone
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Reaching out is a sign of strength. Talk to someone right
                    now.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {HELPLINES.map((h, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-red-100"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {h.name}
                      </p>
                      <p className="text-xs text-slate-500">{h.hours}</p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    >
                      {h.number}
                    </a>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/support/helplines")}
                className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-md"
              >
                View all support resources →
              </button>
            </div>
          )}

          {/* Insights — visual strips */}
          {dailyData.insights?.length > 0 && (
            <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2.5rem] p-8 shadow-lg border border-teal-100 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-teal-100 to-transparent rounded-tl-full opacity-40" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="p-2 bg-teal-100 rounded-xl text-teal-600 text-lg border border-teal-200">
                    ✨
                  </span>
                  <h3 className="text-[#4A148C] font-bold font-serif text-lg">
                    Today's Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  {dailyData.insights.map((insight, i) => {
                    const accent = getInsightAccent(insight.type);
                    return (
                      <div
                        key={i}
                        className={`rounded-2xl border ${accent.border} ${accent.bg} overflow-hidden hover:shadow-md transition-all duration-200`}
                      >
                        <div className="flex">
                          <div
                            className={`w-1.5 ${accent.strip} flex-shrink-0`}
                          />
                          <div className="p-4 flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm">{accent.icon}</span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${accent.tagColor}`}
                              >
                                {accent.tag}
                              </span>
                            </div>
                            <p className="font-bold text-sm text-slate-800 mb-1">
                              {insight.message}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {insight.detail}
                            </p>
                            {insight.action && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-700 font-medium italic">
                                <span>💡</span>
                                <span>{insight.action}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SUGGESTIONS + XGBOOST FORECAST ────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2.5rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-amber-200 to-transparent rounded-bl-full opacity-15" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-100 to-transparent rounded-tr-full opacity-15" />
          <div className="relative z-10">
            {/* ── Suggestions Header ── */}
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl text-lg border border-amber-200 shadow-sm">
                💡
              </span>
              <div>
                <h3 className="text-[#4A148C] font-bold font-serif text-lg leading-tight">
                  For You Today
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Personalised suggestions based on your check-ins
                </p>
              </div>
            </div>

            {/* ── Suggestion Cards ── */}
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {recommendations.map((rec, i) => {
                const accent = REC_ACCENTS[i % REC_ACCENTS.length];
                return (
                  <div
                    key={i}
                    className={`group/rec p-4 rounded-2xl bg-white/80 border border-amber-100 ${accent.lightBg} ${accent.borderHover} transition-all duration-200 hover:shadow-md cursor-default`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${accent.gradient} text-white text-xs font-bold flex items-center justify-center shadow-sm mt-0.5 group-hover/rec:scale-110 transition-transform duration-200`}
                      >
                        {accent.icon}
                      </span>
                      <p className="text-[13px] text-slate-700 leading-relaxed font-medium flex-1">
                        {rec}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── XGBoost Week Ahead Forecast ── */}
            {xgboostPrediction && xgboostPrediction.length > 0 && (
              <div className="bg-white/70 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">🔮</span>
                  <h4 className="text-[#4A148C] font-bold text-sm">
                    Your Week Ahead
                  </h4>
                  <span className="ml-auto text-[10px] text-slate-400 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    AI Forecast
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {xgboostPrediction.slice(0, 7).map((p, i) => {
                    const { label, emoji, bar, pill } = getWellnessLabel(
                      p.predicted_risk,
                    );
                    const dayName = new Date(p.date).toLocaleDateString(
                      "en-US",
                      { weekday: "short" },
                    );
                    const isToday = i === 0;

                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-default
                    ${isToday ? "bg-gradient-to-b from-purple-50 to-white border border-purple-200 shadow-sm" : "bg-white/60 border border-amber-50"}`}
                      >
                        {/* Day */}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wide ${isToday ? "text-purple-500" : "text-slate-400"}`}
                        >
                          {isToday ? "TMR" : dayName}
                        </span>

                        {/* Emoji mood */}
                        <span className="text-lg leading-none">{emoji}</span>

                        {/* Bar indicator */}
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${bar} transition-all duration-500`}
                            style={{
                              width: `${(p.predicted_risk / 10) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Label pill */}
                        <span
                          className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${pill} text-center leading-tight`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-3">
                  Forecasts update daily based on your recent patterns ✨
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── WELLNESS ROW: Activity + Breathing ──────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wellness Activity */}
        <div className="group bg-gradient-to-br from-white to-pink-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-pink-100 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full opacity-30" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-pink-100 rounded-lg border border-pink-200 text-sm">
                  🎮
                </span>
                <h3 className="text-[#4A148C] font-bold text-lg font-serif">
                  Wellness Activity
                </h3>
              </div>
              <button
                onClick={() => setCurrentActivity(rand(funActivities))}
                className="text-xs text-[#7B1FA2] font-bold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors hover:scale-105"
              >
                Shuffle 🔀
              </button>
            </div>
            {currentActivity && (
              <div className="bg-white/70 p-5 rounded-2xl border border-pink-100 hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-gradient-to-br from-pink-50 to-white p-3 rounded-2xl shadow-sm border border-pink-100">
                    {currentActivity.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#4A148C] font-bold">
                        {currentActivity.title}
                      </h4>
                      <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                        {currentActivity.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">
                      {currentActivity.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breathing Exercise */}
        <div className="group bg-gradient-to-br from-white to-blue-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-200 to-transparent rounded-br-full opacity-30" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 rounded-lg border border-blue-200 text-sm">
                  🫁
                </span>
                <h3 className="text-[#4A148C] font-bold text-lg font-serif">
                  Breathe & Reset
                </h3>
              </div>
              <button
                onClick={() => setCurrentBreathing(rand(breathingExercises))}
                className="text-xs text-[#7B1FA2] font-bold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors hover:scale-105"
              >
                Next 🔀
              </button>
            </div>
            {currentBreathing && (
              <div className="bg-white/70 p-5 rounded-2xl border border-blue-100 hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-gradient-to-br from-blue-50 to-white p-3 rounded-2xl shadow-sm border border-blue-100">
                    {currentBreathing.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#4A148C] font-bold">
                        {currentBreathing.name}
                      </h4>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        {currentBreathing.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {currentBreathing.pattern.split("-").map((num, i) => (
                        <React.Fragment key={i}>
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            {num}
                          </span>
                          {i <
                            currentBreathing.pattern.split("-").length - 1 && (
                              <span className="text-blue-300 text-xs">→</span>
                            )}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">
                      {currentBreathing.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
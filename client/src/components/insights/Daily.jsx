// src/components/insights/Daily.jsx
import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Daily({ dailyData, onRefresh }) {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentBreathing, setCurrentBreathing] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);

  if (!dailyData) return null;

  const funActivities = [
    {
      title: "Dance Break",
      description: "Put on your favorite song and dance for 3 minutes",
      icon: "💃",
    },
    {
      title: "Gratitude List",
      description: "Write down 3 things you're grateful for today",
      icon: "🙏",
    },
    {
      title: "Plant Care",
      description: "Water a plant or spend time in nature for 10 minutes",
      icon: "🌿",
    },
    {
      title: "Read & Relax",
      description: "Read a chapter of a book or interesting article",
      icon: "📖",
    },
    {
      title: "Doodle Time",
      description: "Draw or doodle freely for 5 minutes without judgment",
      icon: "✏️",
    },
    {
      title: "Mindful Tea",
      description: "Make your favorite drink and enjoy it slowly",
      icon: "🍵",
    },
    {
      title: "Small Win",
      description: "Complete one small task you've been putting off",
      icon: "✅",
    },
    {
      title: "Connect",
      description: "Send a kind message to someone you care about",
      icon: "💌",
    },
  ];

  const breathingExercises = [
    {
      icon: "🌊",
      name: "Ocean Breathing",
      pattern: "4-4-4",
      description: "Inhale for 4, hold for 4, exhale for 4",
      duration: "2 minutes",
    },
    {
      icon: "📦",
      name: "Box Breathing",
      pattern: "4-4-4-4",
      description: "Inhale 4, hold 4, exhale 4, hold 4",
      duration: "3 minutes",
    },
    {
      icon: "😌",
      name: "4-7-8 Technique",
      pattern: "4-7-8",
      description: "Inhale 4, hold 7, exhale 8",
      duration: "2 minutes",
    },
  ];

  const positiveTips = [
    "💪 You're stronger than you think",
    "🌟 Every small step counts",
    "🌈 This too shall pass",
    "✨ You're doing better than you realize",
    "🎯 Progress, not perfection",
    "🌺 Be kind to yourself today",
    "🚀 You've overcome 100% of your bad days",
    "💝 You deserve good things",
    "🌞 New day, new opportunities",
  ];

  useEffect(() => {
    randomizeAll();
  }, []);

  const randomizeAll = () => {
    setCurrentActivity(
      funActivities[Math.floor(Math.random() * funActivities.length)],
    );
    setCurrentBreathing(
      breathingExercises[Math.floor(Math.random() * breathingExercises.length)],
    );
    setCurrentTip(
      positiveTips[Math.floor(Math.random() * positiveTips.length)],
    );
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

  const getAlertIcon = (type) => {
    switch (type) {
      case "CRITICAL":
        return "🚨";
      case "URGENT":
        return "⚠️";
      case "WARNING":
        return "📉";
      case "EARLY_WARNING":
        return "💡";
      case "RELAPSE_WARNING":
        return "🔄";
      case "ATTENTION":
        return "👀";
      default:
        return "📊";
    }
  };

  const getAlertStyle = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-300 hover:bg-red-100";
      case "high":
        return "bg-orange-50 border-orange-300 hover:bg-orange-100";
      case "medium":
        return "bg-amber-50 border-amber-300 hover:bg-amber-100";
      default:
        return "bg-blue-50 border-blue-300 hover:bg-blue-100";
    }
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case "POSITIVE":
        return "bg-emerald-50 border-emerald-200";
      case "RECOVERY":
        return "bg-teal-50 border-teal-200";
      case "INFO":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ALERTS SECTION - TOP PRIORITY */}
      {dailyData.alerts && dailyData.alerts.length > 0 && (
        <div className="space-y-3">
          {dailyData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`
                rounded-[2rem] p-6 border-2 flex items-start gap-4 transition-all duration-300
                ${getAlertStyle(alert.severity)}
              `}
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
                  <button
                    className="px-5 py-2.5 bg-white border-2 border-current rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                    onClick={() => {
                      // TODO: Navigate to appropriate assessment
                      console.log("Action:", alert.action);
                    }}
                  >
                    {alert.action}
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Risk Score & Pattern Analysis */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Risk Score Card */}
          <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-[#7B1FA2] font-bold tracking-wide uppercase text-xs mb-2 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-200">
                {dayName}, {dateStr}
              </h2>
              <h3 className="text-2xl font-serif text-[#4A148C] mb-8 font-bold">
                Daily Risk Score
              </h3>

              {/* Radial Chart */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={20}
                    data={[
                      {
                        value: dailyData.score,
                        fill: getLevelColor(dailyData.level),
                      },
                    ]}
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
                  <span className="text-6xl font-bold text-slate-800 tracking-tighter">
                    {dailyData.score}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold mt-3 uppercase tracking-wide border-2 ${getRiskBadgeStyle(dailyData.level)}`}
                  >
                    {dailyData.level} Risk
                  </span>
                </div>
              </div>

              {/* Pattern Analysis */}
              {dailyData.pattern_analysis && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-sm flex items-center gap-2">
                        <span>📈</span> Trend
                      </span>
                      <span
                        className={`font-bold ${dailyData.pattern_analysis.velocity_interpretation ===
                            "Improving"
                            ? "text-emerald-600"
                            : dailyData.pattern_analysis
                              .velocity_interpretation === "Worsening"
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}
                      >
                        {dailyData.pattern_analysis.velocity_interpretation}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-sm flex items-center gap-2">
                        <span>🎭</span> Mood Stability
                      </span>
                      <span
                        className={`font-bold ${dailyData.pattern_analysis.mood_stability === "Stable"
                            ? "text-emerald-600"
                            : dailyData.pattern_analysis.mood_stability ===
                              "Moderate"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                      >
                        {dailyData.pattern_analysis.mood_stability}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment CTA - Only show if intervention needed */}
          {dailyData.pattern_analysis?.early_intervention_needed && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">🎯</span>
                <div className="flex-1">
                  <h4 className="font-bold text-[#4A148C] mb-2 text-lg">
                    Assessment Recommended
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Based on your recent patterns, taking a quick assessment can
                    help us provide better support.
                  </p>
                  <button
                    className="w-full py-3 bg-gradient-to-r from-[#7B1FA2] to-[#4A148C] text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02]"
                    onClick={() => {
                      // TODO: Navigate to assessment
                      console.log("Take assessment");
                    }}
                  >
                    Take 2-Min Assessment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="w-full py-4 rounded-[2rem] bg-white border border-purple-100 text-slate-600 hover:text-[#7B1FA2] shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500"
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

        {/* MIDDLE COLUMN - Insights & Factors */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Positive Insights */}
          {dailyData.insights && dailyData.insights.length > 0 && (
            <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-teal-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10">
                <h3 className="card-title text-[#4A148C] flex items-center gap-3 mb-6 font-bold font-serif text-2xl">
                  <span className="p-2 bg-teal-100 rounded-xl text-teal-600 text-lg border border-teal-200">
                    ✨
                  </span>
                  Today's Insights
                </h3>

                <div className="space-y-3">
                  {dailyData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-colors ${getInsightStyle(insight.type)}`}
                    >
                      <p className="font-bold text-sm text-slate-800 mb-1">
                        {insight.message}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {insight.detail}
                      </p>
                      {insight.action && (
                        <p className="text-xs text-teal-700 font-medium mt-2 italic">
                          💡 {insight.action}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contributing Factors / Positive Highlights */}
          <div className={`group bg-gradient-to-br from-white ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "to-purple-50 border-purple-100" : "to-emerald-50 border-emerald-100"} rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex-1 flex flex-col`}>
            <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "from-purple-200" : "from-emerald-200"} to-transparent rounded-tl-full opacity-30 group-hover:scale-110 transition-transform duration-700`}></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <h3 className="card-title text-[#4A148C] flex items-center gap-3 mb-6 font-bold font-serif text-2xl">
                <span className={`p-2 rounded-xl text-lg border ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                  {dailyData.top_factors && dailyData.top_factors.length > 0 ? "🧬" : "🌟"}
                </span>
                {dailyData.top_factors && dailyData.top_factors.length > 0 ? "Key Factors" : "Positive Highlights"}
              </h3>

              {/* Show current risk level badge */}
              <div className={`mb-4 p-4 rounded-2xl border ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">
                    Current Risk Level
                  </span>
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide border-2 ${getRiskBadgeStyle(dailyData.level)}`}
                  >
                    {dailyData.level}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {(dailyData.top_factors && dailyData.top_factors.length > 0 ? dailyData.top_factors : positiveTips.slice(0, 4)).map((factor, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 transition-colors ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "hover:bg-purple-50" : "hover:bg-emerald-50"}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${dailyData.top_factors && dailyData.top_factors.length > 0 ? "bg-purple-400" : "bg-emerald-400"}`}></div>
                    <span className="text-slate-700 font-medium">
                      {factor}
                    </span>
                  </div>
                ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Recommendations & Activities */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Recommendations */}
          <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10">
              <h3 className="card-title text-[#4A148C] flex items-center gap-3 mb-6 font-bold font-serif text-2xl">
                <span className="p-2 bg-amber-100 rounded-xl text-amber-600 text-lg border border-amber-200">
                  💡
                </span>
                Suggestions
              </h3>
              <div className="space-y-3">
                {dailyData.recommendations &&
                  dailyData.recommendations.length > 0 ? (
                  dailyData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium flex-1">
                          {rec}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-sm font-medium text-center">
                    ✓ Keep up the great work! Maintain your current routine.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wellness Activity */}
          <div className="group bg-gradient-to-br from-white to-pink-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-pink-100 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#4A148C] font-bold text-lg font-serif">
                  Wellness Activity
                </h3>
                <button
                  onClick={() =>
                    setCurrentActivity(
                      funActivities[
                      Math.floor(Math.random() * funActivities.length)
                      ],
                    )
                  }
                  className="text-xs text-[#7B1FA2] hover:text-[#4A148C] font-bold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors hover:bg-purple-100"
                >
                  Shuffle 🔀
                </button>
              </div>
              {currentActivity && (
                <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                      {currentActivity.icon}
                    </span>
                    <div>
                      <h4 className="text-[#4A148C] font-bold mb-1">
                        {currentActivity.title}
                      </h4>
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
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#4A148C] font-bold text-lg font-serif">
                  Breathe & Reset
                </h3>
                <button
                  onClick={() =>
                    setCurrentBreathing(
                      breathingExercises[
                      Math.floor(Math.random() * breathingExercises.length)
                      ],
                    )
                  }
                  className="text-xs text-[#7B1FA2] hover:text-[#4A148C] font-bold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors hover:bg-purple-100"
                >
                  Next 🔀
                </button>
              </div>
              {currentBreathing && (
                <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                      {currentBreathing.icon}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[#4A148C] font-bold mb-1">
                        {currentBreathing.name}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        {currentBreathing.pattern} • {currentBreathing.duration}
                      </p>
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

      {/* FULL WIDTH POSITIVE TIP */}
      <div className="lg:col-span-3">
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-orange-400"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-2xl font-serif italic text-[#4A148C] leading-relaxed">
                "{currentTip}"
              </p>
            </div>
            <button
              onClick={randomizeAll}
              className="ml-6 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors"
              title="Get new tip & activities"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#7B1FA2]"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

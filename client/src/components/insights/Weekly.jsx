// src/components/insights/Weekly.jsx
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, AlertCircle, Eye, EyeOff } from 'lucide-react';

// ── Friendly label helpers ─────────────────────────────────────────────────
const getWellnessLabel = (score) => {
  if (score < 30) return { label: "Thriving", emoji: "🌟", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score < 50) return { label: "Doing Well", emoji: "😊", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score < 65) return { label: "Managing", emoji: "🙂", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  if (score < 80) return { label: "Needs Care", emoji: "💛", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Reach Out", emoji: "🤗", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
};

const getTrendMessage = (trend) => {
  if (trend === 'improving') return { msg: "Your wellbeing is getting better!", emoji: "🌈" };
  if (trend === 'declining') return { msg: "You've had a tougher week — that's okay.", emoji: "💙" };
  return { msg: "Things have been steady this week.", emoji: "⚖️" };
};

export default function Weekly({ weeklyData }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!weeklyData) return null;

  const normalizeScore = (score) => {
    if (score === null || score === undefined) return 0;
    if (score <= 1) return parseFloat((score * 100).toFixed(2));
    return parseFloat(score.toFixed(2));
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-600';
    if (trend === 'declining') return 'text-red-500';
    return 'text-slate-400';
  };

  const calculateWeekVelocity = () => {
    if (!weeklyData.chart_data || weeklyData.chart_data.length < 2) return null;
    const scores = weeklyData.chart_data.map(d => normalizeScore(d.overall));
    const first = scores[0];
    const last = scores[scores.length - 1];
    return ((last - first) / scores.length).toFixed(1);
  };

  const weeklyVelocity = calculateWeekVelocity();
  const hasRapidIncrease = weeklyVelocity && parseFloat(weeklyVelocity) > 3;
  const hasHighRiskDays = weeklyData.chart_data?.filter(d => d.level === 'HIGH' || d.level === 'CRITICAL').length || 0;

  const avgScore = normalizeScore(weeklyData.summary.avg_score);
  const wellnessInfo = getWellnessLabel(avgScore);
  const trendInfo = getTrendMessage(weeklyData.summary.trend);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-slate-500 mb-2 text-sm font-bold">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }}></div>
              <span className="text-slate-700 font-medium text-sm">
                {entry.name}: {getWellnessLabel(normalizeScore(entry.value)).label}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const normalizedChartData = weeklyData.chart_data?.map(day => ({
    ...day,
    overall: normalizeScore(day.overall),
    depression: normalizeScore(day.depression),
    anxiety: normalizeScore(day.anxiety),
    stress: normalizeScore(day.stress),
    sleep: normalizeScore(day.sleep)
  })) || [];

  return (
    <div className="space-y-8">
      {/* Weekly Summary Alert */}
      {(hasRapidIncrease || hasHighRiskDays >= 3) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[2rem] p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-1">Weekly Pattern Alert</h4>
            <p className="text-sm text-slate-600">
              {hasRapidIncrease && `We noticed some changes in your patterns this week. `}
              {hasHighRiskDays >= 3 && `You had some tougher days — and that's okay. `}
              Consider taking a comprehensive assessment or reaching out to someone you trust.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview — Friendly labels, no raw scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* How you're doing */}
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">This Week</div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{wellnessInfo.emoji}</span>
                <span className={`text-2xl font-bold font-serif ${wellnessInfo.color}`}>{wellnessInfo.label}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-[#7B1FA2] shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100 relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-teal-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Weekly Direction</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{trendInfo.emoji}</span>
                <span className={`text-lg font-bold capitalize ${getTrendColor(weeklyData.summary.trend)}`}>
                  {weeklyData.summary.trend}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">{trendInfo.msg}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-100/50 ${getTrendColor(weeklyData.summary.trend)}`}>
              {weeklyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
          </div>
        </div>

        {/* Consistency */}
        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-200 to-transparent rounded-tl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Consistency</div>
              <div className="text-4xl font-bold text-slate-800 font-serif">{weeklyData.summary.days_tracked}<span className="text-lg text-slate-400 font-normal font-sans">/7</span></div>
              <p className="text-xs text-slate-500 mt-1">
                {weeklyData.summary.days_tracked >= 5 ? "Great job staying consistent! 🎉" : "Every check-in counts 💪"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-[#FFA000] shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Trend Chart — always visible */}
      <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-2">Your Week's Flow</h3>
          <p className="text-xs text-slate-400 mb-8">How your wellness shifted day by day</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalizedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  ticks={[20, 50, 80]}
                  tickFormatter={(val) => val <= 30 ? '😊' : val <= 65 ? '🙂' : '💛'}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#8E24AA"
                  strokeWidth={3}
                  name="Wellness"
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#8E24AA' }}
                  activeDot={{ r: 7, fill: '#8E24AA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Snapshots — Friendly labels */}
      <div className="group bg-white/90 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-2">Daily Snapshots</h3>
          <p className="text-xs text-slate-400 mb-8">A gentle look at how each day went</p>
          <div className="grid grid-cols-7 gap-3">
            {normalizedChartData.map((day) => {
              const dayInfo = getWellnessLabel(day.overall);
              return (
                <div key={day.date} className={`flex flex-col items-center gap-3 p-4 rounded-3xl ${dayInfo.bg} border ${dayInfo.border} hover:shadow-md transition-all`}>
                  <div className="text-xs font-bold text-slate-500 uppercase">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-2xl">
                    {dayInfo.emoji}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide ${dayInfo.color}`}>
                    {dayInfo.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BREAKDOWN SECTION with disclaimer ──────────────────────────────── */}
      <div className="space-y-4">
        {/* Disclaimer banner before breakdown */}
        {!showBreakdown ? (
          <div className="bg-gradient-to-r from-purple-50 via-white to-amber-50 rounded-[2rem] p-6 border border-purple-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">💜</span>
                <div>
                  <h4 className="font-bold text-[#4A148C] text-sm mb-1">Detailed Breakdown Available</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This shows how individual areas (mood, anxiety, stress, sleep) changed this week.
                    Remember, these are just patterns to help you reflect — <strong>not a diagnosis</strong>.
                    Ups and downs are completely normal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBreakdown(true)}
                className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Show Breakdown
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Small reminder + hide button */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 italic flex items-center gap-2">
                💜 These patterns are guides, not grades — you're more than any chart.
              </p>
              <button
                onClick={() => setShowBreakdown(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-purple-100 text-sm font-medium text-slate-500 hover:text-[#7B1FA2] hover:border-purple-200 transition-all shadow-sm"
              >
                <EyeOff className="w-4 h-4" />
                Hide Breakdown
              </button>
            </div>

            {/* Category Breakdown Chart */}
            <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-2">Areas Breakdown</h3>
                <p className="text-xs text-slate-400 mb-8">How different areas contributed this week</p>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={normalizedChartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        ticks={[20, 50, 80]}
                        tickFormatter={(val) => val <= 30 ? 'Low' : val <= 65 ? 'Mid' : 'High'}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                      <Bar dataKey="depression" fill="#8E24AA" name="Mood" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="anxiety" fill="#AB47BC" name="Anxiety" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="stress" fill="#CE93D8" name="Stress" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="sleep" fill="#7E57C2" name="Sleep" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
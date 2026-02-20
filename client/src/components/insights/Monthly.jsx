// src/components/insights/Monthly.jsx
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

// ── Friendly label helpers ─────────────────────────────────────────────────
const getWellnessLabel = (score) => {
  if (score < 30) return { label: "Thriving", emoji: "🌟", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score < 50) return { label: "Doing Well", emoji: "😊", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score < 65) return { label: "Managing", emoji: "🙂", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  if (score < 80) return { label: "Needs Care", emoji: "💛", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Reach Out", emoji: "🤗", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
};

const getConsistencyMessage = (days) => {
  if (days >= 25) return { msg: "Incredible dedication! 🏆", tone: "text-emerald-600" };
  if (days >= 18) return { msg: "Great consistency! 🌟", tone: "text-emerald-500" };
  if (days >= 10) return { msg: "Good effort! Keep going 💪", tone: "text-blue-600" };
  return { msg: "Every check-in matters 🌱", tone: "text-amber-600" };
};

export default function Monthly({ monthlyData }) {
  const [viewMode, setViewMode] = useState('daily');
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!monthlyData) return null;

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

  const analyzeMonthlyPatterns = () => {
    if (!monthlyData.chart_data || monthlyData.chart_data.length < 7) return null;

    const scores = monthlyData.chart_data.map(d => normalizeScore(d.overall));
    const highRiskDays = scores.filter(s => s >= 70).length;
    const lowRiskDays = scores.filter(s => s < 30).length;
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    const mean = averageScore;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const volatility = (Math.sqrt(variance) / mean) * 100;

    return {
      highRiskDays,
      lowRiskDays,
      volatility: volatility.toFixed(1),
      isUnstable: volatility > 25
    };
  };

  const patterns = analyzeMonthlyPatterns();
  const avgScore = normalizeScore(monthlyData.summary.avg_score);
  const wellnessInfo = getWellnessLabel(avgScore);
  const consistencyInfo = getConsistencyMessage(monthlyData.summary.days_tracked);

  const getTrendMessage = (trend) => {
    if (trend === 'improving') return "Your monthly trend is moving in a positive direction! 🌈";
    if (trend === 'declining') return "This month had its challenges — every month is different. 💙";
    return "Things have been steady this month. ⚖️";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-slate-500 mb-2 text-sm font-bold">
            {viewMode === 'weekly' ? label : new Date(label).toLocaleDateString()}
          </p>
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

  const normalizedChartData = monthlyData.chart_data?.map(day => ({
    ...day,
    overall: normalizeScore(day.overall),
    depression: normalizeScore(day.depression),
    anxiety: normalizeScore(day.anxiety),
    stress: normalizeScore(day.stress),
    sleep: normalizeScore(day.sleep)
  })) || [];

  const normalizedWeeklyData = monthlyData.weekly_overview?.map(week => ({
    ...week,
    avg_score: normalizeScore(week.avg_score)
  })) || [];

  return (
    <div className="space-y-8">
      {/* Monthly Summary Insights */}
      {patterns && patterns.isUnstable && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[2rem] p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-1">Monthly Pattern Noticed</h4>
            <p className="text-sm text-slate-600">
              Your wellbeing had some ups and downs this month — that's perfectly human.
              {patterns.highRiskDays > 0 && ` You had some tougher days, and that's okay.`}
              {' '}If you'd like extra support, consider chatting with a mental health professional. 💙
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid — Friendly labels, no raw scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Wellness */}
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#7B1FA2] flex items-center justify-center mb-3 mx-auto shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Overall</div>
            <div className="text-2xl mb-1">{wellnessInfo.emoji}</div>
            <div className={`text-lg font-bold font-serif ${wellnessInfo.color}`}>
              {wellnessInfo.label}
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200 to-transparent rounded-tr-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-teal-100/50 flex items-center justify-center mb-3 mx-auto shadow-sm ${getTrendColor(monthlyData.summary.trend)}`}>
              {monthlyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Trend</div>
            <div className={`text-xl font-bold capitalize ${getTrendColor(monthlyData.summary.trend)}`}>
              {monthlyData.summary.trend}
            </div>
          </div>
        </div>

        {/* Tracked Days */}
        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-3 mx-auto shadow-sm text-[#FFA000]">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Tracked</div>
            <div className="text-3xl font-bold text-slate-800 font-serif">{monthlyData.summary.days_tracked}</div>
            <p className={`text-[10px] mt-1 font-medium ${consistencyInfo.tone}`}>{consistencyInfo.msg}</p>
          </div>
        </div>

        {/* Consistency */}
        <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-teal-200 to-transparent rounded-tl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal-100/50 text-emerald-600 flex items-center justify-center mb-3 mx-auto shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Consistency</div>
            <div className="text-3xl font-bold text-emerald-600 font-serif">
              {normalizeScore(monthlyData.summary.consistency / 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl inline-flex shadow-sm border border-slate-200">
          <button
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-[#4A148C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setViewMode('daily')}
          >
            Daily Flow
          </button>
          <button
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-[#4A148C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly Review
          </button>
        </div>
      </div>

      {/* Main Overall Chart — always visible */}
      <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-2">
            {viewMode === 'weekly' ? 'Weekly Averages' : '30-Day Trend'}
          </h3>
          <p className="text-xs text-slate-400 mb-8">Your wellness journey over the past month</p>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'weekly' ? (
                <BarChart data={normalizedWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(week) => `Week ${week}`}
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
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="avg_score" fill="#8E24AA" name="Wellness" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              ) : (
                <AreaChart data={normalizedChartData}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8E24AA" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8E24AA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    minTickGap={30}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="overall"
                    stroke="#8E24AA"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOverall)"
                    name="Wellness"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── BREAKDOWN SECTION with disclaimer ──────────────────────────────── */}
      <div className="space-y-4">
        {!showBreakdown ? (
          <div className="bg-gradient-to-r from-purple-50 via-white to-amber-50 rounded-[2rem] p-6 border border-purple-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">💜</span>
                <div>
                  <h4 className="font-bold text-[#4A148C] text-sm mb-1">Detailed Breakdown Available</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This shows how individual areas (mood, anxiety, stress, sleep) changed over the month.
                    Remember, these are just patterns to help you reflect — <strong>not a diagnosis</strong>.
                    Every month brings different challenges, and that's perfectly normal.
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

            {/* Category Trends Chart */}
            <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-2">How Different Areas Evolved</h3>
                <p className="text-xs text-slate-400 mb-8">Track how each area of your wellbeing changed over the month</p>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={normalizedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                        stroke="#94a3b8"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        minTickGap={30}
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
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                      <Line type="monotone" dataKey="depression" stroke="#8E24AA" strokeWidth={2} name="Mood" dot={false} />
                      <Line type="monotone" dataKey="anxiety" stroke="#AB47BC" strokeWidth={2} name="Anxiety" dot={false} />
                      <Line type="monotone" dataKey="stress" stroke="#CE93D8" strokeWidth={2} name="Stress" dot={false} />
                      <Line type="monotone" dataKey="sleep" stroke="#7E57C2" strokeWidth={2} name="Sleep" dot={false} />
                    </LineChart>
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
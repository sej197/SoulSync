// src/components/insights/Weekly.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

export default function Weekly({ weeklyData }) {
  if (!weeklyData) return null;

  // Helper to normalize score (handle both 0-1 and 0-100 range)
  const normalizeScore = (score) => {
    if (score === null || score === undefined) return 0;
    // If score is between 0-1, convert to 0-100
    if (score <= 1) return parseFloat((score * 100).toFixed(2));
    // Already in 0-100 range
    return parseFloat(score.toFixed(2));
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'MODERATE': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'HIGH': return 'bg-red-50 text-red-700 border border-red-100';
      case 'CRITICAL': return 'bg-red-100 text-red-900 border border-red-200';
      default: return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-600';
    if (trend === 'declining') return 'text-red-500';
    return 'text-slate-400';
  };

  // Calculate week's velocity
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-slate-500 mb-2 text-sm font-bold">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }}></div>
              <span className="text-slate-700 font-medium text-sm">
                {entry.name}: {normalizeScore(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Normalize all chart data
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
              {hasRapidIncrease && `Your scores increased by ${weeklyVelocity} points/day this week. `}
              {hasHighRiskDays >= 3 && `You had ${hasHighRiskDays} high-risk days. `}
              Consider taking a comprehensive assessment.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Average Risk</div>
              <div className="text-4xl font-bold text-slate-800 font-serif">
                {normalizeScore(weeklyData.summary.avg_score).toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-[#7B1FA2] shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-teal-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-teal-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Weekly Trend</div>
              <div className={`text-2xl font-bold capitalize ${getTrendColor(weeklyData.summary.trend)}`}>
                {weeklyData.summary.trend}
              </div>
              {weeklyVelocity && (
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {weeklyVelocity > 0 ? '+' : ''}{weeklyVelocity} pts/day
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-100/50 ${getTrendColor(weeklyData.summary.trend)}`}>
              {weeklyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-200 to-transparent rounded-tl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Consistency</div>
              <div className="text-4xl font-bold text-slate-800 font-serif">{weeklyData.summary.days_tracked}<span className="text-lg text-slate-400 font-normal font-sans">/7</span></div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-[#FFA000] shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overall Trend Chart */}
        <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-8">Overall Score Trend</h3>
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
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Legend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#8E24AA"
                    strokeWidth={3}
                    name="Overall Score"
                    dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#8E24AA' }}
                    activeDot={{ r: 7, fill: '#8E24AA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-8">Factors Breakdown</h3>
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
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="depression" fill="#8E24AA" name="Depression" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="anxiety" fill="#AB47BC" name="Anxiety" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="stress" fill="#CE93D8" name="Stress" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sleep" fill="#7E57C2" name="Sleep" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Snapshots */}
      <div className="group bg-white/90 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-8">Daily Snapshots</h3>
          <div className="grid grid-cols-7 gap-3">
            {normalizedChartData.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[#FAFAFA] border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {day.overall.toFixed(2)}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border uppercase tracking-wide ${getLevelBadgeClass(day.level)}`}>
                  {day.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
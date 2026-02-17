// src/components/insights/Monthly.jsx
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Monthly({ monthlyData }) {
  const [viewMode, setViewMode] = useState('daily');

  if (!monthlyData) return null;

  // Helper to normalize score (handle both 0-1 and 0-100 range)
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

  // Analyze monthly patterns
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
                {entry.name}: {normalizeScore(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Normalize chart data
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
            <h4 className="font-bold text-slate-800 mb-1">Monthly Pattern Analysis</h4>
            <p className="text-sm text-slate-600">
              Your scores varied significantly this month (volatility: {patterns.volatility}%). 
              {patterns.highRiskDays > 0 && ` You had ${patterns.highRiskDays} high-risk days.`}
              {' '}Consider discussing these patterns with a mental health professional.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-200 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#7B1FA2] flex items-center justify-center mb-3 mx-auto shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Average</div>
            <div className="text-3xl font-bold text-slate-800 font-serif">
              {normalizeScore(monthlyData.summary.avg_score).toFixed(2)}
            </div>
          </div>
        </div>

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

        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-transparent rounded-br-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-3 mx-auto shadow-sm text-[#FFA000]">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Tracked</div>
            <div className="text-3xl font-bold text-slate-800 font-serif">{monthlyData.summary.days_tracked}</div>
          </div>
        </div>

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

      {/* Main Chart */}
      <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-8">
            {viewMode === 'weekly' ? 'Weekly Averages' : '30-Day Trend'}
          </h3>

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
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="avg_score" fill="#8E24AA" name="Avg Score" radius={[8, 8, 0, 0]} maxBarSize={60} />
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
                    tick={{ fill: '#64748b', fontSize: 12 }}
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
                    name="Overall Score"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Trends */}
      <div className="group bg-white/80 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-40 group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#4A148C] mb-8">Factor Trends</h3>
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
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Line type="monotone" dataKey="depression" stroke="#8E24AA" strokeWidth={2} name="Depression" dot={false} />
                <Line type="monotone" dataKey="anxiety" stroke="#AB47BC" strokeWidth={2} name="Anxiety" dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#CE93D8" strokeWidth={2} name="Stress" dot={false} />
                <Line type="monotone" dataKey="sleep" stroke="#7E57C2" strokeWidth={2} name="Sleep" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
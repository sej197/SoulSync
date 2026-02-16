// src/components/insights/Weekly.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, BarChart2 } from 'lucide-react';

export default function Weekly({ weeklyData }) {
  if (!weeklyData) return null;

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'CRITICAL': return 'bg-red-900/50 text-red-200 border-red-700/50';
      default: return 'bg-gray-700/50 text-gray-400';
    }
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-400';
    if (trend === 'declining') return 'text-red-400';
    return 'text-gray-400';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a2e] border border-white/10 p-4 rounded-xl shadow-xl">
          <p className="text-gray-400 mb-2">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }}></div>
              <span className="text-white font-medium">{entry.name}: {entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Average Risk</div>
            <div className="text-4xl font-bold text-white">{weeklyData.summary.avg_score}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-bloom-primary/20 flex items-center justify-center text-bloom-primary">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Weekly Trend</div>
            <div className={`text-2xl font-bold capitalize ${getTrendColor(weeklyData.summary.trend)}`}>
              {weeklyData.summary.trend}
            </div>
            <div className="text-xs text-gray-500 mt-1">vs previous week</div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ${getTrendColor(weeklyData.summary.trend)}`}>
            {weeklyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Consistency</div>
            <div className="text-4xl font-bold text-white">{weeklyData.summary.days_tracked}<span className="text-lg text-gray-500 font-normal">/7</span></div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overall Trend Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-xl font-serif text-white mb-6">Overall Score Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#c896f4"
                  strokeWidth={4}
                  name="Overall Score"
                  dot={{ r: 4, fill: '#1a1a2e', strokeWidth: 2, stroke: '#c896f4' }}
                  activeDot={{ r: 6, fill: '#c896f4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-xl font-serif text-white mb-6">Factors Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData.chart_data} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="depression" fill="#ef4444" name="Dep" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="anxiety" fill="#f59e0b" name="Anx" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="stress" fill="#3b82f6" name="Str" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="sleep" fill="#c896f4" name="Slp" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Risk Levels */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-xl font-serif text-white mb-6">Daily Snapshots</h3>
        <div className="flex flex-wrap gap-4 justify-between">
          {weeklyData.chart_data.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-2 flex-1 min-w-[60px] p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-xs font-medium text-gray-400 capitalize">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${getLevelBadgeClass(day.level)}`}>
                {day.level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
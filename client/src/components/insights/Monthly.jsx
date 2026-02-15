import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, CheckCircle } from 'lucide-react';

export default function Monthly({ monthlyData }) {
  const [viewMode, setViewMode] = useState('daily');

  if (!monthlyData) return null;

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-400';
    if (trend === 'declining') return 'text-red-400';
    return 'text-gray-400';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a2e] border border-white/10 p-4 rounded-xl shadow-xl">
          <p className="text-gray-400 mb-2">{label}</p>
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
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl text-center flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-bloom-primary/10 text-bloom-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Average</div>
          <div className="text-3xl font-bold text-white">{monthlyData.summary.avg_score}</div>
        </div>

        <div className="glass-panel p-5 rounded-3xl text-center flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${getTrendColor(monthlyData.summary.trend)}`}>
            {monthlyData.summary.trend === 'improving' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          </div>
          <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Trend</div>
          <div className={`text-xl font-bold capitalize ${getTrendColor(monthlyData.summary.trend)}`}>
            {monthlyData.summary.trend}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl text-center flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Tracked</div>
          <div className="text-3xl font-bold text-white">{monthlyData.summary.days_tracked}</div>
        </div>

        <div className="glass-panel p-5 rounded-3xl text-center flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Consistency</div>
          <div className="text-3xl font-bold text-emerald-400">{monthlyData.summary.consistency}%</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/20 p-1 rounded-xl inline-flex backdrop-blur-sm border border-white/5">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'daily' ? 'bg-bloom-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('daily')}
          >
            Daily Flow
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'weekly' ? 'bg-bloom-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly Review
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-xl font-serif text-white mb-6">
          {viewMode === 'weekly' ? 'Weekly Averages' : '30-Day Trend'}
        </h3>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'weekly' ? (
              <BarChart data={monthlyData.weekly_overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(week) => `W${week}`}
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_score" fill="#c896f4" name="Avg Score" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            ) : (
              <AreaChart data={monthlyData.chart_data}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c896f4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c896f4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af' }}
                  minTickGap={30}
                />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="overall"
                  stroke="#c896f4"
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

      {/* Category Trends Line Chart */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-xl font-serif text-white mb-6">Factor Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                stroke="#6b7280"
                tick={{ fill: '#9ca3af' }}
                minTickGap={30}
              />
              <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="depression" stroke="#ef4444" strokeWidth={2} name="Dep" dot={false} />
              <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} name="Anx" dot={false} />
              <Line type="monotone" dataKey="stress" stroke="#3b82f6" strokeWidth={2} name="Str" dot={false} />
              <Line type="monotone" dataKey="sleep" stroke="#c896f4" strokeWidth={2} name="Slp" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
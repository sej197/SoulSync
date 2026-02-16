// src/components/insights/Weekly.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Weekly({ weeklyData }) {
  if (!weeklyData) return null;

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-slate-500 mb-2 text-sm font-bold">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }}></div>
              <span className="text-slate-700 font-medium text-sm">{entry.name}: {entry.value}%</span>
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
        <div className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F3E5F5] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Average Risk</div>
              <div className="text-4xl font-bold text-slate-800 font-serif">{weeklyData.summary.avg_score}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F3E5F5] flex items-center justify-center text-[#8E24AA] shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E0F2F1] relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0F2F1] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Weekly Trend</div>
              <div className={`text-2xl font-bold capitalize ${getTrendColor(weeklyData.summary.trend)}`}>
                {weeklyData.summary.trend}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">vs previous week</div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-[#E0F2F1] ${getTrendColor(weeklyData.summary.trend)}`}>
              {weeklyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E1F5FE] relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E1F5FE] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Consistency</div>
              <div className="text-4xl font-bold text-slate-800 font-serif">{weeklyData.summary.days_tracked}<span className="text-lg text-slate-400 font-normal font-sans">/7</span></div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E1F5FE] flex items-center justify-center text-[#0288D1] shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overall Trend Chart */}
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F3E5F5] rounded-bl-[100%] opacity-40 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-8">Overall Score Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
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
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#FFF3E0] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFF3E0] rounded-bl-[100%] opacity-40 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-8">Factors Breakdown</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.chart_data} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
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
                  <Bar dataKey="depression" fill="#FF7043" name="Dep" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="anxiety" fill="#FFA726" name="Anx" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="stress" fill="#42A5F5" name="Str" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sleep" fill="#AB47BC" name="Slp" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Risk Levels */}
      <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E3F2FD] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#E3F2FD] rounded-bl-[100%] opacity-40 transition-transform group-hover:scale-110 pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-8">Daily Snapshots</h3>
          <div className="flex flex-wrap gap-4 justify-between">
            {weeklyData.chart_data.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-3 flex-1 min-w-[60px] p-4 rounded-3xl bg-[#FAFAFA] border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
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
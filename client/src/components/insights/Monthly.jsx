// src/components/insights/Monthly.jsx
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Calendar, CheckCircle } from 'lucide-react';

export default function Monthly({ monthlyData }) {
  const [viewMode, setViewMode] = useState('daily');

  if (!monthlyData) return null;

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-600';
    if (trend === 'declining') return 'text-red-500';
    return 'text-slate-400';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-slate-500 mb-2 text-sm font-bold">{label}</p>
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
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F3E5F5] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center mb-3 mx-auto shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Average</div>
            <div className="text-3xl font-bold text-slate-800 font-serif">{monthlyData.summary.avg_score}</div>
          </div>
        </div>

        <div className="group bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E0F2F1] relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0F2F1] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-[#E0F2F1] flex items-center justify-center mb-3 mx-auto shadow-sm ${getTrendColor(monthlyData.summary.trend)}`}>
              {monthlyData.summary.trend === 'improving' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Trend</div>
            <div className={`text-xl font-bold capitalize ${getTrendColor(monthlyData.summary.trend)}`}>
              {monthlyData.summary.trend}
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E1F5FE] relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E1F5FE] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#E1F5FE] text-[#0288D1] flex items-center justify-center mb-3 mx-auto shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Tracked</div>
            <div className="text-3xl font-bold text-slate-800 font-serif">{monthlyData.summary.days_tracked}</div>
          </div>
        </div>

        <div className="group bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E0F2F1] relative overflow-hidden flex flex-col items-center justify-center text-center h-48">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0F2F1] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-emerald-600 flex items-center justify-center mb-3 mx-auto shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-bold font-bold">Consistency</div>
            <div className="text-3xl font-bold text-emerald-600 font-serif">{monthlyData.summary.consistency}%</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl inline-flex shadow-sm border border-slate-200">
          <button
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-[#3E2723] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setViewMode('daily')}
          >
            Daily Flow
          </button>
          <button
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-[#3E2723] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setViewMode('weekly')}
          >
            Weekly Review
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#F3E5F5] rounded-bl-[100%] opacity-40 transition-transform group-hover:scale-110 pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-8">
            {viewMode === 'weekly' ? 'Weekly Averages' : '30-Day Trend'}
          </h3>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'weekly' ? (
                <BarChart data={monthlyData.weekly_overview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(week) => `W${week}`}
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
                  <Bar dataKey="avg_score" fill="#c896f4" name="Avg Score" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData.chart_data}>
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

      {/* Category Trends Line Chart */}
      <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#FFF3E0] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFF3E0] rounded-bl-[100%] opacity-40 transition-transform group-hover:scale-110 pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-8">Factor Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.chart_data}>
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
                <Line type="monotone" dataKey="depression" stroke="#FF7043" strokeWidth={2} name="Dep" dot={false} />
                <Line type="monotone" dataKey="anxiety" stroke="#FFA726" strokeWidth={2} name="Anx" dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#42A5F5" strokeWidth={2} name="Str" dot={false} />
                <Line type="monotone" dataKey="sleep" stroke="#AB47BC" strokeWidth={2} name="Slp" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/components/insights/Monthly.jsx
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Monthly({ monthlyData }) {
  const [viewMode, setViewMode] = useState('daily');

  if (!monthlyData) return null;

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-success';
    if (trend === 'declining') return 'text-error';
    return 'text-base-content';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '↓';
    if (trend === 'declining') return '↑';
    return '→';
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full border" style={{ 
        borderColor: '#e5e7eb', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
        color: 'white' 
      }}>
        <div className="stat">
          <div className="stat-figure" style={{ color: '#c896f4' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Average Score</div>
          <div className="stat-value" style={{ color: '#c896f4' }}>{monthlyData.summary.avg_score}</div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>Past 30 days</div>
        </div>
        
        <div className="stat">
          <div className={`stat-figure ${getTrendColor(monthlyData.summary.trend)}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Trend</div>
          <div className={`stat-value capitalize ${getTrendColor(monthlyData.summary.trend)}`}>
            {monthlyData.summary.trend}
          </div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>{getTrendIcon(monthlyData.summary.trend)} Overall direction</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure" style={{ color: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Days Tracked</div>
          <div className="stat-value" style={{ color: 'white' }}>{monthlyData.summary.days_tracked}</div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>Out of 30 days</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure" style={{ color: '#10b981' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Consistency</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{monthlyData.summary.consistency}%</div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>Tracking rate</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 w-full lg:w-auto" style={{ 
        backgroundColor: '#1a1a2e',
        padding: '0.5rem',
        borderRadius: '0.5rem'
      }}>
        <button 
          className="flex-1 py-2 px-4 rounded-lg font-medium transition"
          onClick={() => setViewMode('weekly')}
          style={viewMode === 'weekly' ? { 
            backgroundColor: '#c896f4', 
            color: 'white' 
          } : { 
            backgroundColor: 'transparent', 
            color: '#9ca3af' 
          }}
        >
          Weekly View
        </button>
        <button 
          className="flex-1 py-2 px-4 rounded-lg font-medium transition"
          onClick={() => setViewMode('daily')}
          style={viewMode === 'daily' ? { 
            backgroundColor: '#c896f4', 
            color: 'white' 
          } : { 
            backgroundColor: 'transparent', 
            color: '#9ca3af' 
          }}
        >
          Daily View
        </button>
      </div>

      {/* Charts */}
      {viewMode === 'weekly' ? (
        <div className="card shadow-xl border" style={{ 
          borderColor: '#e5e7eb', 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' 
        }}>
          <div className="card-body">
            <h3 className="card-title" style={{ color: '#c896f4' }}>Weekly Averages</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData.weekly_overview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={(week) => `Week ${week}`}
                    stroke="#6b7280"
                  />
                  <YAxis domain={[0, 100]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    formatter={(value) => [`${value}%`, 'Avg Score']}
                    labelFormatter={(week) => `Week ${week}`}
                  />
                  <Bar dataKey="avg_score" fill="#c896f4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-xl border" style={{ 
          borderColor: '#e5e7eb', 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' 
        }}>
          <div className="card-body">
            <h3 className="card-title" style={{ color: '#c896f4' }}>Daily Trend (30 Days)</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData.chart_data}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c896f4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#c896f4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#6b7280"
                  />
                  <YAxis domain={[0, 100]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="overall" 
                    stroke="#c896f4" 
                    fillOpacity={1} 
                    fill="url(#colorOverall)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Category Trends */}
      <div className="card shadow-xl border" style={{ 
        borderColor: '#e5e7eb', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
        color: 'white' 
      }}>
        <div className="card-body">
          <h3 className="card-title" style={{ color: '#c896f4' }}>Category Trends</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6b7280"
                />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend />
                <Line type="monotone" dataKey="depression" stroke="#ef4444" strokeWidth={2} name="Depression" />
                <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} name="Anxiety" />
                <Line type="monotone" dataKey="stress" stroke="#3b82f6" strokeWidth={2} name="Stress" />
                <Line type="monotone" dataKey="sleep" stroke="#c896f4" strokeWidth={2} name="Sleep" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
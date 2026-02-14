// src/components/insights/Weekly.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Weekly({ weeklyData }) {
  if (!weeklyData) return null;

  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 'LOW': return 'badge-success';
      case 'MODERATE': return 'badge-warning';
      case 'HIGH': return 'badge-error';
      case 'CRITICAL': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

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
      {/* Stats Overview */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full border" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' }}>
        <div className="stat">
          <div className="stat-figure" style={{ color: '#c896f4' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Average Score</div>
          <div className="stat-value" style={{ color: '#c896f4' }}>{weeklyData.summary.avg_score}</div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>Past 7 days</div>
        </div>
        
        <div className="stat">
          <div className={`stat-figure ${getTrendColor(weeklyData.summary.trend)}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Trend</div>
          <div className={`stat-value capitalize ${getTrendColor(weeklyData.summary.trend)}`}>
            {weeklyData.summary.trend}
          </div>
          <div className="stat-desc" style={{ color: '#9ca3af' }}>{getTrendIcon(weeklyData.summary.trend)} Compared to previous week</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure" style={{ color: 'white' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div className="stat-title" style={{ color: '#6b7280' }}>Consistency</div>
          <div className="stat-value" style={{ color: 'white' }}>{weeklyData.summary.days_tracked}/7</div>
          <div className="stat-desc" style={{ color: '#6b7280' }}>Days tracked</div>
        </div>
      </div>

      {/* Overall Trend Chart */}
      <div className="card shadow-xl border" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' }}>
        <div className="card-body">
          <h3 className="card-title" style={{ color: '#c896f4' }}>Overall Risk Score Trend</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData.chart_data}>
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
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="#c896f4" 
                  strokeWidth={3}
                  name="Overall Score"
                  dot={{ r: 5, fill: '#c896f4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card  shadow-xl border" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' }}>
        <div className="card-body">
          <h3 className="card-title" style={{ color: '#c896f4' }}>Category Breakdown</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData.chart_data}>
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
                <Bar dataKey="depression" fill="#ef4444" name="Depression" />
                <Bar dataKey="anxiety" fill="#f59e0b" name="Anxiety" />
                <Bar dataKey="stress" fill="#3b82f6" name="Stress" />
                <Bar dataKey="sleep" fill="#c896f4" name="Sleep" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Risk Levels */}
      <div className="card shadow-xl border" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white' }}>
        <div className="card-body">
          <h3 className="card-title" style={{ color: '#c896f4' }}>Daily Risk Levels</h3>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {weeklyData.chart_data.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <div className="text-xs font-medium" style={{ color: '#6b7280' }}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`badge ${getLevelBadgeClass(day.level)} badge-lg`}>
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
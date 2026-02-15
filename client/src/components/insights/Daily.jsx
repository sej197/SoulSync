// src/components/insights/Daily.jsx
import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Daily({ dailyData, onRefresh }) {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentBreathing, setCurrentBreathing] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);

  if (!dailyData) return null;

  const funActivities = [
    { title: 'Dance Break', description: 'Put on your favorite song and dance for 3 minutes', icon: '💃' },
    { title: 'Gratitude List', description: 'Write down 3 things you\'re grateful for today', icon: '🙏' },
    { title: 'Plant Care', description: 'Water a plant or spend time in nature for 10 minutes', icon: '🌿' },
    { title: 'Read & Relax', description: 'Read a chapter of a book or interesting article', icon: '📖' },
    { title: 'Doodle Time', description: 'Draw or doodle freely for 5 minutes without judgment', icon: '✏️' },
    { title: 'Mindful Tea', description: 'Make your favorite drink and enjoy it slowly', icon: '🍵' },
    { title: 'Small Win', description: 'Complete one small task you\'ve been putting off', icon: '✅' },
    { title: 'Connect', description: 'Send a kind message to someone you care about', icon: '💌' },
  ];

  const breathingExercises = [
    { icon: '🌊', name: 'Ocean Breathing', pattern: '4-4-4', description: 'Inhale for 4, hold for 4, exhale for 4', duration: '2 minutes' },
    { icon: '📦', name: 'Box Breathing', pattern: '4-4-4-4', description: 'Inhale 4, hold 4, exhale 4, hold 4', duration: '3 minutes' },
    { icon: '😌', name: '4-7-8 Technique', pattern: '4-7-8', description: 'Inhale 4, hold 7, exhale 8', duration: '2 minutes' },
  ];

  const positiveTips = [
    '💪 You\'re stronger than you think', '🌟 Every small step counts', '🌈 This too shall pass',
    '✨ You\'re doing better than you realize', '🎯 Progress, not perfection', '🌺 Be kind to yourself today',
    '🚀 You\'ve overcome 100% of your bad days', '💝 You deserve good things', '🌞 New day, new opportunities',
  ];

  useEffect(() => {
    randomizeAll();
  }, []);

  const randomizeAll = () => {
    setCurrentActivity(funActivities[Math.floor(Math.random() * funActivities.length)]);
    setCurrentBreathing(breathingExercises[Math.floor(Math.random() * breathingExercises.length)]);
    setCurrentTip(positiveTips[Math.floor(Math.random() * positiveTips.length)]);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'LOW': return '#10b981'; // Emerald
      case 'MODERATE': return '#f59e0b'; // Amber
      case 'HIGH': return '#ef4444'; // Red
      case 'CRITICAL': return '#991b1b'; // Dark Red
      default: return '#6b7280';
    }
  };

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Risk Score & Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl group-hover:scale-110 transition-transform duration-500">
            📊
          </div>

          <div className="text-center">
            <h2 className="text-bloom-secondary font-medium tracking-wide uppercase text-sm mb-1">{dayName}, {dateStr}</h2>
            <h3 className="text-2xl font-serif text-white mb-6">Daily Risk Score</h3>

            <div className="relative w-64 h-64 mx-auto mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  barSize={20} data={[{ value: dailyData.score, fill: getLevelColor(dailyData.level) }]}
                  startAngle={90} endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={30} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-white tracking-tighter">{dailyData.score}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 bg-white/10 border border-white/5 uppercase tracking-wide`} style={{ color: getLevelColor(dailyData.level) }}>
                  {dailyData.level} Risk
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{dailyData.trend === 'improving' ? '📉' : '📈'}</span>
                <span className="text-gray-300">
                  {dailyData.trend === 'improving' ? 'Score represents improvement' : 'Score shows varying levels'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-bloom-primary/20 to-purple-600/20 hover:from-bloom-primary/30 hover:to-purple-600/30 border border-bloom-primary/30 text-bloom-secondary hover:text-white transition-all font-medium flex items-center justify-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Insights
        </button>
      </div>

      {/* Middle Column - Factors & Recommendations */}
      <div className="lg:col-span-1 space-y-6">
        {/* Contributing Factors */}
        <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
          <h3 className="card-title text-white flex items-center gap-2 mb-6">
            <span className="p-2 bg-bloom-primary/10 rounded-lg text-bloom-primary text-lg">🧬</span>
            Key Factors
          </h3>

          <div className="space-y-3 flex-1">
            {dailyData.top_factors && dailyData.top_factors.length > 0 ? (
              dailyData.top_factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                  <div className="w-1.5 h-1.5 rounded-full bg-bloom-primary"></div>
                  <span className="text-gray-200">{factor}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 bg-white/5 rounded-2xl border border-dashed border-gray-700">
                No significant risk factors detected today. ✨
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Recommendations */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="card-title text-white flex items-center gap-2 mb-6">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 text-lg">💡</span>
            Suggestions
          </h3>
          <div className="space-y-4">
            {dailyData.recommendations && dailyData.recommendations.length > 0 ? (
              dailyData.recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                  <p className="text-sm text-gray-200 leading-relaxed">{rec}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-sm">
                Keep up the great work! Maintain your current routine.
              </div>
            )}
          </div>
        </div>

        {/* Quick Win / Activity */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white font-serif text-lg">Wellness Activity</h3>
            <button onClick={() => setCurrentActivity(funActivities[Math.floor(Math.random() * funActivities.length)])} className="text-xs text-bloom-primary hover:text-white transition">Shuffle 🔀</button>
          </div>
          {currentActivity && (
            <div className="bg-gradient-to-br from-bloom-primary/20 to-purple-900/40 p-5 rounded-2xl border border-bloom-primary/20">
              <div className="flex items-start gap-4">
                <span className="text-3xl bg-black/20 p-2 rounded-xl">{currentActivity.icon}</span>
                <div>
                  <h4 className="text-white font-bold">{currentActivity.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{currentActivity.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Width Tip */}
      <div className="lg:col-span-3">
        <div className="glass-panel p-6 rounded-2xl text-center bg-gradient-to-r from-bloom-primary/5 via-white/5 to-bloom-primary/5">
          <p className="text-xl font-serif italic text-bloom-secondary">"{currentTip}"</p>
        </div>
      </div>
    </div>
  );
}
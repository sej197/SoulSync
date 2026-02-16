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
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#FFF3E0] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFF3E0] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10 text-center">
            <h2 className="text-[#EF6C00] font-bold tracking-wide uppercase text-xs mb-2 bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-100">{dayName}, {dateStr}</h2>
            <h3 className="text-2xl font-serif text-[#3E2723] mb-8 font-bold">Daily Risk Score</h3>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  barSize={20} data={[{ value: dailyData.score, fill: getLevelColor(dailyData.level) }]}
                  startAngle={90} endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: 'rgba(0,0,0,0.05)' }} dataKey="value" cornerRadius={30} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-slate-800 tracking-tighter">{dailyData.score}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase tracking-wide bg-slate-100 border border-slate-200`} style={{ color: getLevelColor(dailyData.level) }}>
                  {dailyData.level} Risk
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{dailyData.trend === 'improving' ? '📉' : '📈'}</span>
                <span className="text-slate-600 font-medium text-sm">
                  {dailyData.trend === 'improving' ? 'Score represents improvement' : 'Score shows varying levels'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-full py-4 rounded-[2rem] bg-white border border-[#FFF3E0] text-slate-600 hover:text-[#EF6C00] shadow-sm hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 group"
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
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F3E5F5] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10 flex-1">
            <h3 className="card-title text-[#3E2723] flex items-center gap-3 mb-6 font-bold font-serif text-2xl">
              <span className="p-2 bg-purple-50 rounded-xl text-purple-600 text-lg border border-purple-100">🧬</span>
              Key Factors
            </h3>

            <div className="space-y-3">
              {dailyData.top_factors && dailyData.top_factors.length > 0 ? (
                dailyData.top_factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:bg-purple-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-slate-700 font-medium">{factor}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No significant risk factors detected today. ✨
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Recommendataions */}
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E0F2F1] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#E0F2F1] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="card-title text-[#3E2723] flex items-center gap-3 mb-6 font-bold font-serif text-2xl">
              <span className="p-2 bg-teal-50 rounded-xl text-teal-600 text-lg border border-teal-100">💡</span>
              Suggestions
            </h3>
            <div className="space-y-4">
              {dailyData.recommendations && dailyData.recommendations.length > 0 ? (
                dailyData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:bg-teal-50 transition-colors">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-sm font-medium">
                  Keep up the great work! Maintain your current routine.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Win / Activity */}
        <div className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E3F2FD] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E3F2FD] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#3E2723] font-bold text-lg font-serif">Wellness Activity</h3>
              <button onClick={() => setCurrentActivity(funActivities[Math.floor(Math.random() * funActivities.length)])} className="text-xs text-[#0277BD] hover:text-[#01579B] font-bold bg-[#E1F5FE] px-2 py-1 rounded-lg border border-[#B3E5FC]">Shuffle 🔀</button>
            </div>
            {currentActivity && (
              <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-4">
                  <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">{currentActivity.icon}</span>
                  <div>
                    <h4 className="text-[#3E2723] font-bold">{currentActivity.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-snug">{currentActivity.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Tip */}
      <div className="lg:col-span-3">
        <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#F3E5F5] relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-orange-400"></div>

          <div className="relative z-10">
            <p className="text-2xl font-serif italic text-[#5D4037] leading-relaxed">"{currentTip}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
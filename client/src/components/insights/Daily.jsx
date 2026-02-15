// src/components/insights/Daily.jsx
import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Daily({ dailyData, onRefresh }) {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentBreathing, setCurrentBreathing] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);

  if (!dailyData) return null;


  const funActivities = [
    { title: 'Dance Break', description: 'Put on your favorite song and dance for 3 minutes' },
    { title: 'Gratitude List', description: 'Write down 3 things you\'re grateful for today' },
    { title: 'Plant Care', description: 'Water a plant or spend time in nature for 10 minutes' },
    { title: 'Read & Relax', description: 'Read a chapter of a book or interesting article' },
    { title: 'Doodle Time', description: 'Draw or doodle freely for 5 minutes without judgment' },
    { title: 'Mindful Tea', description: 'Make your favorite drink and enjoy it slowly' },
    {  title: 'Small Win', description: 'Complete one small task you\'ve been putting off' },
    { title: 'Connect', description: 'Send a kind message to someone you care about' },
  ];

  const breathingExercises = [
    { 
      icon: '🌊', 
      name: 'Ocean Breathing', 
      pattern: '4-4-4',
      description: 'Inhale for 4, hold for 4, exhale for 4',
      duration: '2 minutes'
    },
    { 
      icon: '📦', 
      name: 'Box Breathing', 
      pattern: '4-4-4-4',
      description: 'Inhale 4, hold 4, exhale 4, hold 4',
      duration: '3 minutes'
    },
    { 
      icon: '😌', 
      name: '4-7-8 Technique', 
      pattern: '4-7-8',
      description: 'Inhale 4, hold 7, exhale 8',
      duration: '2 minutes'
    },
    { 
      icon: '🌬️', 
      name: 'Deep Belly Breathing', 
      pattern: '5-5',
      description: 'Deep inhale 5, slow exhale 5',
      duration: '3 minutes'
    },
    { 
      icon: '⚡', 
      name: 'Energizing Breath', 
      pattern: 'quick',
      description: '30 quick breaths, then hold for 15 seconds',
      duration: '1 minute'
    },
  ];

  const positiveTips = [
    '💪 You\'re stronger than you think',
    '🌟 Every small step counts',
    '🌈 This too shall pass',
    '✨ You\'re doing better than you realize',
    '🎯 Progress, not perfection',
    '🌺 Be kind to yourself today',
    '🚀 You\'ve overcome 100% of your bad days',
    '💝 You deserve good things',
    '🌞 New day, new opportunities',
    '🎨 Your feelings are valid',
  ];

  useEffect(() => {
    // Randomize activities on mount
    randomizeAll();
  }, []);

  const randomizeAll = () => {
    setCurrentActivity(funActivities[Math.floor(Math.random() * funActivities.length)]);
    setCurrentBreathing(breathingExercises[Math.floor(Math.random() * breathingExercises.length)]);
    setCurrentTip(positiveTips[Math.floor(Math.random() * positiveTips.length)]);
  };

  const randomizeActivity = () => {
    const newActivity = funActivities[Math.floor(Math.random() * funActivities.length)];
    setCurrentActivity(newActivity);
  };

  const randomizeBreathing = () => {
    const newBreathing = breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
    setCurrentBreathing(newBreathing);
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'LOW': return '#10b981';
      case 'MODERATE': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      case 'CRITICAL': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 'LOW': return 'badge-success';
      case 'MODERATE': return 'badge-warning';
      case 'HIGH': return 'badge-error';
      case 'CRITICAL': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '↓';
    if (trend === 'declining') return '↑';
    return '→';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Side - Risk Score */}
      <div className="lg:col-span-1">
        <div className="card shadow-2xl h-full" style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white'
        }}>
          <div className="card-body items-center text-center flex flex-col justify-center">
            <div className="badge badge-outline badge-lg mb-4" style={{ borderColor: '#c896f4', color: '#c896f4' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <h2 className="text-2xl font-bold mb-6">Today's Risk Score</h2>
            
            {/* Radial Chart */}
            <div className="relative w-56 h-56 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  data={[{ value: dailyData.score, fill: getLevelColor(dailyData.level) }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{dailyData.score}</div>
                <div className={`badge ${getLevelBadgeClass(dailyData.level)} badge-lg mt-3`}>
                  {dailyData.level}
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="alert w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}>
              <span className="text-xl">{getTrendIcon(dailyData.trend)}</span>
              <span className="capitalize text-sm">{dailyData.trend} from yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle - Contributing Factors & Recommendations */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Contributing Factors */}
        <div className="card shadow-xl border flex-1" style={{ 
          borderColor: '#e5e7eb',  
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)' 
        }}>
          <div className="card-body">
            <h3 className="card-title" style={{ color: 'white' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: '#c896f4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contributing Factors
            </h3>
            <div className="grid md:grid-cols-1 gap-3 mt-4">
              {dailyData.top_factors && dailyData.top_factors.length > 0 ? (
                dailyData.top_factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#c896f4' }}></div>
                    <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{factor}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                    Great news! No significant risk factors detected today. Keep up the good work!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card shadow-xl border flex-1" style={{ 
          borderColor: '#e5e7eb',  
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)' 
        }}>
          <div className="card-body">
            <h3 className="card-title" style={{ color: 'white' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: '#c896f4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </h3>
            <div className="grid md:grid-cols-1 gap-3 mt-4">
              {dailyData.recommendations && dailyData.recommendations.length > 0 ? (
                dailyData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#c896f4' }}></div>
                    <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{rec}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                      You're doing well! Continue with your current healthy habits.
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                      Maintain regular sleep schedule and stay connected with your support system.
                    </span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                      Keep practicing self-care and monitoring your mental wellness journey.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button 
          className="btn btn-block text-white" 
          onClick={onRefresh}
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)' }}
          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #2d2d4a 0%, #3d3d5a 100%)'}
          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Score
        </button>
      </div>

      {/* Right Side - Wellness Activities */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Positive Affirmation */}
        <div className="card shadow-xl border" style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
          color: 'white'
        }}>
          <div className="card-body text-center">
            <p className="text-lg font-semibold">{currentTip}</p>
          </div>
        </div>

        {/* Fun Activity */}
        {currentActivity && (
          <div className="card shadow-xl border flex-1" style={{ 
            borderColor: '#e5e7eb',  
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)'
          }}>
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <h3 className="card-title text-sm" style={{ color: 'white' }}>
                  <span className="text-2xl mr-2">{currentActivity.icon}</span>
                  Quick Activity
                </h3>
                <button 
                  onClick={randomizeActivity}
                  className="btn btn-xs btn-circle"
                  style={{ backgroundColor: '#c896f4', borderColor: '#c896f4' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                <h4 className="font-bold mb-2" style={{ color: '#1a1a2e' }}>{currentActivity.title}</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>{currentActivity.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Breathing Exercise */}
        {currentBreathing && (
          <div className="card shadow-xl border flex-1" style={{ 
            borderColor: '#e5e7eb',  
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)'
          }}>
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <h3 className="card-title text-sm" style={{ color: 'white' }}>
                  <span className="text-2xl mr-2">{currentBreathing.icon}</span>
                  Breathing Exercise
                </h3>
                <button 
                  onClick={randomizeBreathing}
                  className="btn btn-xs btn-circle"
                  style={{ backgroundColor: '#c896f4', borderColor: '#c896f4' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                <h4 className="font-bold mb-2" style={{ color: '#1a1a2e' }}>{currentBreathing.name}</h4>
                <div className="badge badge-outline mb-2" style={{ borderColor: '#c896f4', color: '#c896f4' }}>
                  {currentBreathing.pattern}
                </div>
                <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{currentBreathing.description}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Duration: {currentBreathing.duration}</p>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}
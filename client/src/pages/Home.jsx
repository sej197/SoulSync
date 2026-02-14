// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const cognitiveExercises = [
  { title: 'Memory Game', description: 'Try remembering 5 random items from your room without looking', icon: '🧩' },
  { title: 'Count Backwards', description: 'Count backwards from 100 by 7s (100, 93, 86...)', icon: '🔢' },
  { title: 'Word Association', description: 'Pick a word and list 10 related words in 60 seconds', icon: '💭' },
  { title: 'Color Challenge', description: 'Name 5 things around you for each color of the rainbow', icon: '🌈' },
  { title: 'Alphabet Game', description: 'Name an animal for each letter A-Z as fast as you can', icon: '🔤' },
  { title: 'Quick Math', description: 'Multiply any two-digit numbers in your head', icon: '➗' },
];

const wellnessTips = [
  { tip: 'Take 5 deep breaths', icon: '🫁' },
  { tip: 'Drink a glass of water', icon: '💧' },
  { tip: 'Stand and stretch for 2 minutes', icon: '🧘' },
  { tip: 'Write down 3 things you\'re grateful for', icon: '✍️' },
  { tip: 'Step outside for fresh air', icon: '🌿' },
];

const quickActions = [
  { title: 'Daily Quiz', description: 'Check your mental wellness', icon: '📝', route: '/daily-quiz', color: '#c896f4' },
  { title: 'Journal', description: 'Express your thoughts', icon: '📔', route: '/journal', color: '#f59e0b' },
  { title: 'Chatbot', description: 'Talk to our AI companion', icon: '💬', route: '/chatbot', color: '#3b82f6' },
  { title: 'Community', description: 'Connect with others', icon: '👥', route: '/community', color: '#10b981' },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [randomTip, setRandomTip] = useState(wellnessTips[0]);
  const [userName] = useState('User'); // Replace with actual user name from auth

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setRandomTip(wellnessTips[Math.floor(Math.random() * wellnessTips.length)]);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a1a2e' }}>
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-500">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a2e' }}>
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(action.route)}
                    className="card shadow-xl border cursor-pointer hover:scale-105 transition-transform"
                    style={{ 
                      borderColor: '#e5e7eb',
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
                    }}
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{action.icon}</span>
                        <h3 className="card-title text-white text-lg">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Wellness Tip */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',
              background: 'linear-gradient(135deg, #c896f4 0%, #a855f7 100%)',
            }}>
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{randomTip.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-xl">Quick Wellness Tip</h3>
                    <p className="text-white text-opacity-90">Take a moment for yourself</p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-white text-lg font-medium">{randomTip.tip}</p>
                </div>
              </div>
            </div>

            {/* Your Progress */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
            }}>
              <div className="card-body">
                <h3 className="card-title text-white mb-4">
                  <span className="mr-2">📊</span>
                  Your Progress
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#c896f4' }}>7</div>
                    <p className="text-sm text-gray-400">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#10b981' }}>12</div>
                    <p className="text-sm text-gray-400">Journal Entries</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>85%</div>
                    <p className="text-sm text-gray-400">Completion</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/insights')}
                  className="btn btn-block mt-4 text-white"
                  style={{ backgroundColor: '#c896f4', borderColor: '#c896f4' }}
                >
                  View Detailed Insights
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cognitive Exercises */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',  
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
              color: 'white'
            }}>
              <div className="card-body">
                <h3 className="card-title text-sm mb-3">
                  <span className="text-2xl mr-2">🧠</span>
                  Brain Boost
                </h3>
                <div className="space-y-2">
                  {cognitiveExercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition cursor-pointer">
                      <span className="text-xl flex-shrink-0">{exercise.icon}</span>
                      <div>
                        <p className="font-semibold text-xs">{exercise.title}</p>
                        <p className="text-xs opacity-80">{exercise.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn btn-sm btn-block mt-3 bg-white bg-opacity-10 border-0 text-white hover:bg-opacity-20"
                >
                  See All Exercises
                </button>
              </div>
            </div>

            {/* Mood Tracker */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',  
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
              color: 'white'
            }}>
              <div className="card-body">
                <h3 className="card-title text-sm mb-3">
                  <span className="text-2xl mr-2">😊</span>
                  How are you feeling?
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {['😢', '😟', '😐', '🙂', '😄'].map((emoji, index) => (
                    <button
                      key={index}
                      className="aspect-square rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center mt-3 opacity-70">Track your daily mood</p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',  
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
              color: 'white'
            }}>
              <div className="card-body">
                <h3 className="card-title text-sm mb-3">
                  <span className="text-2xl mr-2">📅</span>
                  Upcoming
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white bg-opacity-10">
                    <div className="bg-purple-500 rounded-lg p-2 text-center min-w-[50px]">
                      <p className="text-xs">Today</p>
                      <p className="text-lg font-bold">14</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Daily Check-in</p>
                      <p className="text-xs opacity-70">Complete your wellness quiz</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white bg-opacity-10">
                    <div className="bg-blue-500 rounded-lg p-2 text-center min-w-[50px]">
                      <p className="text-xs">Mon</p>
                      <p className="text-lg font-bold">17</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Group Session</p>
                      <p className="text-xs opacity-70">Community chat at 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful Resources */}
            <div className="card shadow-xl border" style={{ 
              borderColor: '#e5e7eb',  
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
              color: 'white'
            }}>
              <div className="card-body">
                <h3 className="card-title text-sm mb-3">
                  <span className="text-2xl mr-2">📚</span>
                  Resources
                </h3>
                <div className="space-y-2">
                  <a href="#" className="block p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">
                    <p className="font-semibold text-xs">Crisis Hotline</p>
                    <p className="text-xs opacity-70">24/7 Support: 988</p>
                  </a>
                  <a href="#" className="block p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">
                    <p className="font-semibold text-xs">Meditation Guide</p>
                    <p className="text-xs opacity-70">5-minute breathing exercises</p>
                  </a>
                  <a href="#" className="block p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">
                    <p className="font-semibold text-xs">Sleep Tips</p>
                    <p className="text-xs opacity-70">Improve your rest quality</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
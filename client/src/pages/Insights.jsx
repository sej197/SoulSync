// src/pages/Insights.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Daily from '../components/insights/Daily';
import Weekly from '../components/insights/Weekly';
import Monthly from '../components/insights/Monthly';

export default function Insights() {
  const { user } = useContext(AuthContext);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const userId = user?.id;

  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    if (userId) fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      const resDaily = await fetch(`${BASE_URL}/api/risk/dailyInsights/${userId}`);
      const daily = await resDaily.json();
      setDailyData(daily.daily);

      const resWeekly = await fetch(`${BASE_URL}/api/risk/weeklyInsights/${userId}`);
      const weekly = await resWeekly.json();
      setWeeklyData(weekly);

      const resMonthly = await fetch(`${BASE_URL}/api/risk/monthlyInsights/${userId}`);
      const monthly = await resMonthly.json();
      setMonthlyData(monthly);

      setError(null);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a]">
        <span className="loading loading-spinner loading-lg text-bloom-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-[#0f0f1a] min-h-screen text-white">
        <div role="alert" className="alert alert-error bg-red-900/50 border-red-900 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 className="font-bold">Error loading insights</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button className="btn btn-sm btn-ghost text-white" onClick={fetchInsights}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-100 overflow-x-hidden selection:bg-bloom-primary selection:text-white pb-20">
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0px, 0px); }
            33% { transform: translate(30px, -50px); }
            66% { transform: translate(-20px, 20px); }
            100% { transform: translate(0px, 0px); }
          }
          .animate-float {
            animation: float 20s ease-in-out infinite;
          }
           .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
        `}
      </style>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-bloom-primary/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 bg-clip-text text-transparent bg-gradient-to-r from-bloom-secondary via-bloom-primary to-white">
            Mental Wellness Insights
          </h1>
          <p className="text-gray-400 text-lg">Track your emotional journey and discover patterns.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="bg-white/5 p-1 rounded-2xl inline-flex backdrop-blur-md border border-white/10">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 capitalize ${activeTab === tab
                    ? 'bg-bloom-primary text-white shadow-lg shadow-bloom-primary/20 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'daily' && <Daily dailyData={dailyData} onRefresh={fetchInsights} />}
          {activeTab === 'weekly' && <Weekly weeklyData={weeklyData} />}
          {activeTab === 'monthly' && <Monthly monthlyData={monthlyData} />}
        </div>
      </div>
    </div>
  );
}
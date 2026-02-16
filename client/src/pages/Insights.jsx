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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="flex items-center justify-center min-h-screen bg-[#F3E5F5]">
        <span className="loading loading-spinner loading-lg text-purple-400"></span>
        <p className="ml-4 text-slate-500 font-medium">Gathering your insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-[#F3E5F5] min-h-screen text-slate-800 pt-20">
        <div role="alert" className="alert alert-error bg-red-50 border-red-100 text-red-800 shadow-sm max-w-2xl mx-auto rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 className="font-bold">Error loading insights</h3>
            <div className="text-xs opacity-75">{error}</div>
          </div>
          <button className="btn btn-sm bg-white text-red-700 hover:bg-red-50 border-none shadow-sm" onClick={fetchInsights}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5F5] text-slate-800 overflow-x-hidden selection:bg-[#FFCC80] selection:text-[#3E2723] pb-20 pt-24 font-sans relative">
      <style>
        {`
          @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          }
          .animate-morph {
            animation: morph 8s ease-in-out infinite;
          }
          .blob-shape {
             position: absolute;
             filter: blur(80px);
             opacity: 0.6;
             transition: transform 0.1s linear;
          }
        `}
      </style>

      {/* Parallax Background Blobs matching Home/About */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="blob-shape bg-[#FFE0B2] w-[600px] h-[600px] top-[-10%] right-[-10%] animate-morph"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        ></div>
        <div
          className="blob-shape bg-[#B2DFDB] w-[500px] h-[500px] top-[40%] left-[-10%] animate-morph"
          style={{ transform: `translateY(${scrollY * -0.15}px)`, animationDelay: '-2s' }}
        ></div>
        <div
          className="blob-shape bg-[#FFCCBC] w-[700px] h-[700px] bottom-[-20%] right-[-5%] animate-morph"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, animationDelay: '-4s' }}
        ></div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs font-bold text-[#EF6C00] mb-3 shadow-sm border border-orange-100">
              📈 YOUR PROGRESS
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3 text-[#3E2723]">
              Mental Wellness Insights
            </h1>
            <p className="text-slate-500 text-lg max-w-xl">Track your emotional journey, discover patterns, and celebrate your growth.</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/60 p-1.5 rounded-2xl inline-flex backdrop-blur-md shadow-sm border border-white/40">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 capitalize text-sm ${activeTab === tab
                  ? 'bg-[#3E2723] text-white shadow-lg scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} View
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
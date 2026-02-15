// src/pages/Insights.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Daily from '../components/insights/Daily';
import Weekly from '../components/insights/Weekly';
import Monthly from '../components/insights/Monthly';

export default function Insights() {
  //const userId = "698f3604a22b9b8627800279";
  const { user, getAuthStatus } = useContext(AuthContext);
  console.log('Insights Page - User:', user.id);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const userId = user.id; 
  
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    fetchInsights();
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <span className="loading loading-spinner loading-lg" style={{ color: '#c896f4' }}></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-white min-h-screen">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Error loading insights</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={fetchInsights}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#1a1a2e' }}>
            Mental Health Insights
          </h1>
          <p className="text-gray-500 mt-2">Track your mental wellness journey</p>
        </div>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-8 w-fit" style={{ backgroundColor: '#1a1a2e' }}>
          <a 
            className={`tab tab-lg ${activeTab === 'daily' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('daily')}
            style={activeTab === 'daily' ? { backgroundColor: '#c896f4', color: 'white' } : { color: '#9ca3af' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Daily
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'weekly' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('weekly')}
            style={activeTab === 'weekly' ? { backgroundColor: '#c896f4', color: 'white' } : { color: '#9ca3af' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Weekly
          </a>
          <a 
            className={`tab tab-lg ${activeTab === 'monthly' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('monthly')}
            style={activeTab === 'monthly' ? { backgroundColor: '#c896f4', color: 'white' } : { color: '#9ca3af' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Monthly
          </a>
        </div>

        {/* Content */}
        {activeTab === 'daily' && <Daily dailyData={dailyData} onRefresh={fetchInsights} />}
        {activeTab === 'weekly' && <Weekly weeklyData={weeklyData} />}
        {activeTab === 'monthly' && <Monthly monthlyData={monthlyData} />}
      </div>
    </div>
  );
}
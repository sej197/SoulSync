import React, { useState, useEffect } from 'react';
import { getStreakInfo } from '../lib/streakapi';
import { Flame, Trophy } from 'lucide-react';

const StreakIndicator = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const data = await getStreakInfo();
        setStreak(data);
      } catch (error) {
        console.error('Error fetching streak:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStreak, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-base-200/50 animate-pulse">
        <Flame className="w-5 h-5 text-base-content/30" />
        <span className="w-4 h-4 bg-base-content/10 rounded-full"></span>
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  const currentStreak = streak.currentStreak || 0;
  const isOnFire = currentStreak > 0;

  // Simple logic to find next milestone (e.g., 3, 7, 14, 30, 60, 90, 100...)
  const milestones = [3, 7, 14, 21, 30, 60, 90, 100, 365];
  const nextMilestone = milestones.find(m => m > currentStreak) || (currentStreak + 10);
  const daysToGo = nextMilestone - currentStreak;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 border backdrop-blur-md cursor-help ${isOnFire
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]'
            : 'bg-base-200/50 border-base-300 text-base-content/70 hover:bg-base-200'
          }`}
      >
        <div className="relative">
          <Flame className={`w-5 h-5 ${isOnFire ? 'text-orange-500 fill-orange-500 animate-[bounce_2s_infinite]' : 'text-gray-400'}`} />
          {isOnFire && (
            <div className="absolute inset-0 bg-orange-400 blur-sm opacity-50 animate-pulse rounded-full"></div>
          )}
        </div>
        <span className="font-bold font-serif text-lg">{currentStreak}</span>
      </div>

      {/* Tooltip */}
      <div className={`absolute top-full right-0 mt-2 w-64 p-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 z-50 transition-all duration-300 origin-top-right
        ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100
      `}>
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Current Streak</h4>
            <p className="text-2xl font-bold font-serif">{currentStreak} <span className="text-sm font-sans font-normal opacity-70">days</span></p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium opacity-80">
            <span>Next Milestone: {nextMilestone} days</span>
            <span>{daysToGo} days left</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000"
              style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-2 italic opacity-70">
            {isOnFire ? "You're on fire! Keep it up! 🔥" : "Start your streak with a daily quiz!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakIndicator;

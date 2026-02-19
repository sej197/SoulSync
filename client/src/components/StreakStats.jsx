import React, { useState, useEffect } from 'react';
import { getStreakStats } from '../lib/streakapi';
import { Flame, Award, Calendar, TrendingUp, Target } from 'lucide-react';

const StreakStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getStreakStats(timeframe);
        setStats(data);
      } catch (error) {
        console.error('Error fetching streak stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="p-6 bg-base-200/50 rounded-2xl animate-pulse">
        <div className="h-8 bg-base-300 rounded-lg w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-base-300 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-base-300 rounded-2xl"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="opacity-70">Unable to load streak statistics</p>
      </div>
    );
  }

  const { streakInfo, timeframeStats, quizCalendar } = stats;
  const { currentStreak = 0, longestStreak = 0, totalQuizzesCompleted = 0 } = streakInfo;
  const { consistency = 0 } = timeframeStats;

  // Calculate next milestone
  const nextMilestones = [3, 7, 14, 21, 30, 60, 90, 100, 365];
  const nextMilestone = nextMilestones.find(m => m > currentStreak) || (currentStreak + 10);
  const progressToNext = Math.min(100, (currentStreak / nextMilestone) * 100);

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = timeframe - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const isCompleted = quizCalendar && quizCalendar[dateKey]?.completed;
      days.push({
        date,
        dateKey,
        completed: isCompleted,
        score: quizCalendar?.[dateKey]?.score
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  // Group by weeks for the heatmap
  const weeks = [];
  let currentWeek = [];

  // Align start date to correct day of week
  const startDay = calendarDays[0].date.getDay(); // 0 is Sunday
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null); // Empty slots
  }

  calendarDays.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek); // Push remaining days
  }

  return (
    <div className="space-y-8">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bloom-primary to-purple-600 text-white p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Flame size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Flame className="w-6 h-6 text-orange-200" />
            </div>
            <span className="font-semibold tracking-wide uppercase text-sm opacity-90">Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-6xl font-black font-serif tracking-tight">{currentStreak}</h1>
            <span className="text-xl opacity-80">days on fire!</span>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
              <span>Progress to {nextMilestone} days</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000"
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Award className="w-6 h-6 text-yellow-500" />}
          label="Longest Streak"
          value={longestStreak}
          unit="days"
          bg="bg-yellow-500/10 dark:bg-yellow-500/5"
          border="border-yellow-500/20"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-blue-500" />}
          label="Total Quizzes"
          value={totalQuizzesCompleted}
          unit="completed"
          bg="bg-blue-500/10 dark:bg-blue-500/5"
          border="border-blue-500/20"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          label="Consistency"
          value={`${consistency}%`}
          unit="last 30 days"
          bg="bg-green-500/10 dark:bg-green-500/5"
          border="border-green-500/20"
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-purple-500" />}
          label="Next Goal"
          value={nextMilestone}
          unit="days streak"
          bg="bg-purple-500/10 dark:bg-purple-500/5"
          border="border-purple-500/20"
        />
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, unit, bg, border }) => (
  <div className={`p-5 rounded-2xl border ${border} ${bg} backdrop-blur-sm transition-all hover:-translate-y-1`}>
    <div className="flex items-center gap-3 mb-3 opacity-80">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-black font-serif">{value}</span>
      <span className="text-xs opacity-60 font-medium">{unit}</span>
    </div>
  </div>
);

export default StreakStats;

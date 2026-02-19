// Streak API calls

export const getStreakInfo = async () => {
  try {
    const res = await fetch('/api/quiz/streak', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch streak info');
    return await res.json();
  } catch (error) {
    console.error('Error fetching streak info:', error);
    return null;
  }
};

export const checkQuizEligibility = async () => {
  try {
    const res = await fetch('/api/quiz/streak/check-eligibility', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to check eligibility');
    return await res.json();
  } catch (error) {
    console.error('Error checking quiz eligibility:', error);
    return null;
  }
};

export const getStreakStats = async (days = 30) => {
  try {
    const res = await fetch(`/api/quiz/streak/stats?days=${days}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch streak stats');
    return await res.json();
  } catch (error) {
    console.error('Error fetching streak stats:', error);
    return null;
  }
};

export const getStreakLeaderboard = async (limit = 10, timeframe = 'current') => {
  try {
    const res = await fetch(`/api/quiz/streak/leaderboard?limit=${limit}&timeframe=${timeframe}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return await res.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

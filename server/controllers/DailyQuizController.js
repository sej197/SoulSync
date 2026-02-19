import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import Streak from "../models/Streak.js";
import { setCache, getCache, invalidateQuizCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";

// Helper function to calculate streak
const calculateStreak = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all quizzes for this user sorted by date descending
    const userQuizzes = await DailyQuiz.find({
      userId,
      quizType: "daily",
      date: { $lt: tomorrow }
    })
      .sort({ date: -1 })
      .lean();

    if (userQuizzes.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastQuizDate: null,
        totalQuizzesCompleted: 0
      };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastQuizDate = userQuizzes[0].date;

    // Check if last quiz was today or yesterday
    const lastQuizDateOnly = new Date(lastQuizDate);
    lastQuizDateOnly.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isStreakActive = 
      (lastQuizDateOnly.getTime() === today.getTime()) || 
      (lastQuizDateOnly.getTime() === yesterday.getTime());

    if (!isStreakActive) {
      // Streak is broken
      tempStreak = 0;
    }

    // Calculate streaks
    for (let i = 0; i < userQuizzes.length; i++) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);

      // Check if next quiz is consecutive day
      if (i + 1 < userQuizzes.length) {
        const currentDate = new Date(userQuizzes[i].date);
        currentDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(userQuizzes[i + 1].date);
        nextDate.setHours(0, 0, 0, 0);

        const dayDifference = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDifference !== 1) {
          // Break in sequence
          if (isStreakActive && i === 0) {
            currentStreak = tempStreak;
          }
          tempStreak = 0;
        }
      } else {
        // Last element
        if (isStreakActive) {
          currentStreak = tempStreak;
        }
      }
    }

    return {
      currentStreak,
      longestStreak,
      lastQuizDate,
      totalQuizzesCompleted: userQuizzes.length
    };
  } catch (error) {
    console.error("Error calculating streak:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastQuizDate: null,
      totalQuizzesCompleted: 0
    };
  }
};

// Helper function to update streak in database
const updateStreakData = async (userId) => {
  try {
    const streakData = await calculateStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for milestone achievements
    const streakMilestones = [7, 14, 30, 60, 100, 365];
    const milestones = [];

    for (const milestone of streakMilestones) {
      if (streakData.currentStreak === milestone) {
        milestones.push({
          milestone,
          achievedDate: new Date()
        });
      }
    }

    const updatedStreak = await Streak.findOneAndUpdate(
      { userId },
      {
        $set: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastQuizDate: streakData.lastQuizDate,
          totalQuizzesCompleted: streakData.totalQuizzesCompleted,
          streakBreakDate: streakData.currentStreak === 0 ? new Date() : null
        },
        $addToSet: {
          streakMilestones: { $each: milestones }
        }
      },
      { upsert: true, new: true }
    );

    return updatedStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
};

// Submit daily quiz
export const submitDailyQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0]

    const { answers } = req.body;

    const optionScores = {
      "Very calm": 0,
      "Mostly calm": 0.25,
      "Occasionally restless": 0.5,
      "Often restless": 0.75,
      "Constantly tense": 1,

      "No anxious moments": 0,
      "Rare anxious moments": 0.25,
      "Sometimes anxious": 0.5,
      "Frequently anxious": 0.75,
      "Anxious all day": 1,

      "Very easy": 0,
      "Mostly easy": 0.25,
      "Somewhat difficult": 0.5,
      "Very difficult": 0.75,
      "Could not relax at all": 1,

      "Fully rested": 0,
      "Mostly rested": 0.25,
      "Slightly tired": 0.5,
      "Very tired": 0.75,
      "Completely exhausted": 1,

      "Very easily": 0,
      "Fairly easily": 0.25,
      "Took some time": 0.5,
      "Very difficult": 0.75,
      "Barely slept": 1,

      "Very supportive": 0,
      "Mostly supportive": 0.25,
      "Somewhat lacking": 0.5,
      "Not supportive": 0.75,
      "Very poor sleep": 1,

      "Very manageable": 0,
      "Mostly manageable": 0.25,
      "Somewhat stressful": 0.5,
      "Hard to manage": 0.75,
      "Completely overwhelming": 1,

      "No stress": 0,
      "Low stress": 0.25,
      "Moderate stress": 0.5,
      "High stress": 0.75,
      "Extreme stress": 1,

      "Not at all": 0,
      "Rarely": 0.25,
      "Sometimes": 0.5,
      "Often": 0.75,
      "Almost constantly": 1,

      "Very light": 0,
      "Mostly light": 0.25,
      "Neutral": 0.5,
      "Heavy": 0.75,
      "Very heavy": 1,

      "Very interested": 0,
      "Mostly interested": 0.25,
      "Slightly interested": 0.5,
      "Hardly interested": 0.75,
      "No interest at all": 1,

      "Very hopeful": 0,
      "Somewhat hopeful": 0.25,
      "Neutral": 0.5,
      "Not very hopeful": 0.75,
      "Not hopeful at all": 1
    };

    const getScore = (answer) => {
      if (Array.isArray(answer)) {
        let total = 0;
        answer.forEach((option) => {
          total += optionScores[option] ?? 0.5;
        });
        return total / answer.length;
      }

      if (typeof answer === "string") {
        return optionScores[answer] ?? 0;
      }

      return 0;
    };

    let anxiety = 0,
      stress = 0,
      sleep = 0,
      depression = 0

    let anxietyCount = 0,
      stressCount = 0,
      sleepCount = 0,
      depressionCount = 0

    let paragraphScore = 0;

    for (const ans of answers) {
      const userAnswer =
        ans.selectedOption || ans.selectedOptions || ans.textAnswer;

      if (
        ans.type === "paragraph" &&
        typeof userAnswer === "string" &&
        userAnswer.trim().length > 0
      ) {
        try {
          const response = await fetch(
            `${process.env.PYTHON_SERVER}/sentiment/analyze`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: userAnswer }),
            }
          );

          const data = await response.json();
          paragraphScore = data.paragraphScore ?? 0;
          ans.sentimentScore = paragraphScore;
        } catch (error) {
          console.error("Sentiment API error:", error.message);
          paragraphScore = 0;
          ans.sentimentScore = 0;
        }

        continue;
      }

      const score = getScore(userAnswer);

      switch (ans.category) {
        case "anxiety":
          anxiety += score;
          anxietyCount++;
          break;
        case "stress":
          stress += score;
          stressCount++;
          break;
        case "sleep":
          sleep += score;
          sleepCount++;
          break;
        case "depression":
          depression += score;
          depressionCount++;
          break;
      }
    }

    anxiety = anxietyCount > 0 ? anxiety / anxietyCount : 0;
    stress = stressCount > 0 ? stress / stressCount : 0;
    sleep = sleepCount > 0 ? sleep / sleepCount : 0;
    depression = depressionCount > 0 ? depression / depressionCount : 0;

    const mentalHealthScore = (anxiety + stress + (1 - sleep) + depression) / 4;
    const socialScore = 0.5;
    const reflectionScore = Math.max(0, 1 - paragraphScore);

    const quizScore = (mentalHealthScore * 0.5 + socialScore * 0.3 + reflectionScore * 0.2);

    const transformedAnswers = answers.map(a => ({
      questionId: a.questionId,
      selectedOptions: Array.isArray(a.selectedOptions) ? a.selectedOptions : [a.selectedOption || a.textAnswer]
    }));

    const quiz = await DailyQuiz.create({
      userId,
      quizType: "daily",
      date: new Date(),
      answers: transformedAnswers,
      scores: {
        anxietyScore: anxiety,
        stressScore: stress,
        sleepScore: sleep,
        depressionScore: depression,
        mentalHealthScore,
        socialScore,
        reflectionScore,
      },
      finalScore: quizScore
    });

    await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          quiz_score: quizScore,
          anxiety_score: anxiety,
          stress_score: stress,
          sleep_score: sleep,
          depression_score: depression,
          quiz_date: today
        }
      },
      { upsert: true, new: true }
    );

    // Update streak information
    const streakInfo = await updateStreakData(userId);

    // Cache the quiz result
    await setCache(cacheKeys.dailyQuiz(userId, today), {
      message: "Daily quiz submitted successfully",
      score: quizScore,
      scores: quiz.scores,
      streak: {
        current: streakInfo.currentStreak,
        longest: streakInfo.longestStreak,
        total: streakInfo.totalQuizzesCompleted
      }
    }, 86400); // Cache for 24 hours

    // Invalidate quiz history cache
    await invalidateQuizCache(userId);

    // Check for badges asynchronously but await for response data
    const newlyAwarded = await checkAndAwardBadges(userId, 'quiz');

    res.status(201).json({
      message: "Daily quiz submitted successfully",
      score: quizScore,
      scores: quiz.scores,
      newlyAwarded,
      streak: {
        current: streakInfo.currentStreak,
        longest: streakInfo.longestStreak,
        total: streakInfo.totalQuizzesCompleted,
        lastQuizDate: streakInfo.lastQuizDate,
        milestones: streakInfo.streakMilestones
      }
    });

  } catch (error) {
    console.error("Error submitting daily quiz:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user's streak information
export const getStreakInfo = async (req, res) => {
  try {
    const userId = req.userId;

    // Try to get from cache first
    const cacheKey = `streak:${userId}`;
    const cachedStreak = await getCache(cacheKey);
    if (cachedStreak) {
      return res.status(200).json(cachedStreak);
    }

    const streak = await Streak.findOne({ userId }).lean();

    if (!streak) {
      // If no streak record, calculate it
      const streakData = await updateStreakData(userId);
      await setCache(cacheKey, streakData, 3600); // Cache for 1 hour
      return res.status(200).json(streakData);
    }

    // Cache the result
    await setCache(cacheKey, streak, 3600);

    res.status(200).json(streak);
  } catch (error) {
    console.error("Error fetching streak info:", error);
    res.status(500).json({
      message: "Error fetching streak information",
      error: error.message
    });
  }
};

// Get leaderboard - top users by current streak
export const getStreakLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(req.query.limit || 10, 100); // Max 100
    const timeframe = req.query.timeframe || "current"; // current or longest

    // Try cache first
    const cacheKey = `leaderboard:${timeframe}:${limit}`;
    const cachedLeaderboard = await getCache(cacheKey);
    if (cachedLeaderboard) {
      return res.status(200).json(cachedLeaderboard);
    }

    const sortField = timeframe === "longest" ? "longestStreak" : "currentStreak";

    const leaderboard = await Streak.find()
      .populate("userId", "name email profilePicture")
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean();

    const formattedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      user: item.userId,
      currentStreak: item.currentStreak,
      longestStreak: item.longestStreak,
      totalQuizzesCompleted: item.totalQuizzesCompleted,
      lastQuizDate: item.lastQuizDate
    }));

    // Cache for 6 hours
    await setCache(cacheKey, formattedLeaderboard, 21600);

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      message: "Error fetching leaderboard",
      error: error.message
    });
  }
};

// Check if user can take quiz today and get streak preview
export const checkQuizEligibility = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has already taken quiz today
    const todayQuiz = await DailyQuiz.findOne({
      userId,
      quizType: "daily",
      date: { $gte: today }
    }).lean();

    if (todayQuiz) {
      return res.status(200).json({
        canTakeQuiz: false,
        message: "You have already completed today's quiz",
        quizTakenAt: todayQuiz.date,
        quizScore: todayQuiz.finalScore
      });
    }

    // Get current streak
    const streak = await Streak.findOne({ userId }).lean();
    const streakData = streak || {
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzesCompleted: 0
    };

    res.status(200).json({
      canTakeQuiz: true,
      message: "You can take the daily quiz now",
      streakPreview: {
        currentStreak: streakData.currentStreak,
        potentialStreak: streakData.currentStreak + 1,
        longestStreak: streakData.longestStreak,
        totalCompleted: streakData.totalQuizzesCompleted
      }
    });
  } catch (error) {
    console.error("Error checking quiz eligibility:", error);
    res.status(500).json({
      message: "Error checking quiz eligibility",
      error: error.message
    });
  }
};

// Get streak history/stats
export const getStreakStats = async (req, res) => {
  try {
    const userId = req.userId;
    const timeframe = req.query.days || 30; // Default 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    startDate.setHours(0, 0, 0, 0);

    // Get all quizzes in timeframe
    const quizzes = await DailyQuiz.find({
      userId,
      quizType: "daily",
      date: { $gte: startDate }
    })
      .sort({ date: 1 })
      .lean();

    // Get streak info
    const streakInfo = await Streak.findOne({ userId }).lean();

    // Calculate calendar heatmap data
    const quizDates = {};
    quizzes.forEach(quiz => {
      const dateKey = quiz.date.toISOString().split("T")[0];
      quizDates[dateKey] = {
        completed: true,
        score: quiz.finalScore,
        date: quiz.date
      };
    });

    res.status(200).json({
      timeframeStats: {
        days: timeframe,
        quizzesCompleted: quizzes.length,
        consistency: Math.round((quizzes.length / timeframe) * 100)
      },
      streakInfo: {
        currentStreak: streakInfo?.currentStreak || 0,
        longestStreak: streakInfo?.longestStreak || 0,
        totalQuizzesCompleted: streakInfo?.totalQuizzesCompleted || 0,
        lastQuizDate: streakInfo?.lastQuizDate,
        milestones: streakInfo?.streakMilestones || []
      },
      quizCalendar: quizDates
    });
  } catch (error) {
    console.error("Error fetching streak stats:", error);
    res.status(500).json({
      message: "Error fetching streak statistics",
      error: error.message
    });
  }
};

export default submitDailyQuiz;
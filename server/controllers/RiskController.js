import { RISK_WEIGHTS, RISK_LABELS } from "../config/riskConfig.js";
import RiskScore from "../models/RiskScore.js";
import DailyQuiz from "../models/DailyQuiz.js";
import { setCache, getCache, invalidateRiskCache, cacheKeys } from "../utils/cacheUtils.js";

// [Keep all the helper functions exactly as they are...]
// calculateDecayRate, getDaysDifference, calculateProxyFromDailyQuiz, 
// getClinicalScore, getRiskLevel, getTrend, getTopFactors, 
// getRecommendations, generateInsights

const calculateDecayRate = (daysOld) => {
  if (daysOld <= 7) return 1.0;
  if (daysOld > 14) return 0.0;
  return 1 - (daysOld - 7) / 7;
};

const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateProxyFromDailyQuiz = (dailyQuizScores) => {
  if (!dailyQuizScores)
    return { stress: 0, sleep: 0, depression: 0, anxiety: 0 };

  const {
    mentalHealthScore = 0,
    stressScore = 0,
    sleepScore = 0,
    socialScore = 0,
    reflectionScore = 0,
  } = dailyQuizScores;

  return {
    stress: stressScore,
    sleep: sleepScore,
    depression:
      (1 - mentalHealthScore) * 0.5 +
      (1 - socialScore) * 0.3 +
      (1 - reflectionScore) * 0.2,
    anxiety:
      (1 - socialScore) * 0.4 +
      stressScore * 0.4 +
      (1 - reflectionScore) * 0.2,
  };
};

const getClinicalScore = async (userId, quizType, today, proxyScores) => {
  const quizTypeMap = {
    depression: "depression",
    anxiety: "anxiety",
    stress: "stress",
    sleep: "sleep",
  };

  const recentQuiz = await DailyQuiz.findOne({
    userId: userId,
    quizType: quizTypeMap[quizType],
    finalScore: { $ne: null },
  }).sort({ date: -1 });

  if (!recentQuiz) {
    return {
      score: proxyScores[quizType] || 0,
      date: null,
    };
  }

  const quizDate = new Date(recentQuiz.date).toISOString().split("T")[0];
  const daysOld = getDaysDifference(quizDate, today);

  const score = recentQuiz.finalScore;

  if (daysOld <= 14) {
    const decayRate = calculateDecayRate(daysOld);
    return {
      score: score * decayRate,
      date: quizDate,
    };
  }

  return {
    score: proxyScores[quizType] || 0,
    date: null,
  };
};

const getRiskLevel = (score) => {
  if (score < 0.3) return "LOW";
  if (score < 0.5) return "MODERATE";
  if (score < 0.7) return "HIGH";
  return "CRITICAL";
};

const getTrend = (current, previous) => {
  if (!previous) return "unknown";
  if (current > previous + 0.1) return "declining";
  if (current < previous - 0.1) return "improving";
  return "stable";
};

const getTopFactors = (scores) => {
  const factors = [];

  for (const { key, label, threshold } of RISK_LABELS) {
    const score = scores[key];
    if (score && score >= threshold) {
      factors.push(`${label} (${(score * 100).toFixed(2)})`);
    }
  }

  return factors.slice(0, 3);
};

const getRecommendations = (factors) => {
  const recs = [];

  if (factors.some((f) => f.includes("depression"))) {
    recs.push("Consider cognitive behavioral therapy (CBT) or counseling.");
  }
  if (factors.some((f) => f.includes("anxiety"))) {
    recs.push("Practice mindfulness and relaxation techniques.");
  }
  if (factors.some((f) => f.includes("stress"))) {
    recs.push("Engage in regular physical activity and stress management.");
  }
  if (factors.some((f) => f.includes("sleep"))) {
    recs.push(
      "Maintain a consistent sleep schedule and create a restful environment.",
    );
  }

  return recs;
};

const generateInsights = (
  velocity,
  volatility,
  currentScore,
  previousScore,
  riskLevel,
) => {
  const insights = [];
  const alerts = [];

  const velocityPercent = velocity * 100;

  if (velocityPercent > 7) {
    alerts.push({
      type: "URGENT",
      severity: "high",
      message: "⚠️ Rapid deterioration detected",
      detail: `Your wellness score is declining by ${velocityPercent.toFixed(1)} points/day. Immediate attention recommended.`,
      action: "Take a comprehensive mental health assessment now",
    });
  } else if (velocityPercent > 3) {
    alerts.push({
      type: "WARNING",
      severity: "medium",
      message: "📉 Declining trend detected",
      detail: `Your scores have been worsening over the past week (+${velocityPercent.toFixed(1)} points/day).`,
      action: "Consider taking a depression or anxiety assessment",
    });
  } else if (velocityPercent < -7) {
    insights.push({
      type: "POSITIVE",
      message: "✅ Significant improvement",
      detail: `Your wellness is improving rapidly (-${Math.abs(velocityPercent).toFixed(1)} points/day). Keep up the great work!`,
    });
  } else if (velocityPercent < -3) {
    insights.push({
      type: "POSITIVE",
      message: "📈 Steady improvement",
      detail: `Your scores are getting better. Continue your current wellness practices.`,
    });
  } else {
    insights.push({
      type: "INFO",
      message: "➡️ Stable pattern",
      detail: "Your wellness scores are relatively consistent this week.",
    });
  }

  if (volatility > 35) {
    alerts.push({
      type: "ATTENTION",
      severity: "medium",
      message: "🎭 High mood instability detected",
      detail: `Your scores vary by ${volatility.toFixed(1)}% day-to-day, which may indicate mood swings.`,
      action: "Consider a mood disorder screening (bipolar/anxiety assessment)",
    });
  } else if (volatility > 20) {
    insights.push({
      type: "INFO",
      message: "📊 Moderate mood fluctuation",
      detail: `Your daily scores show some variation (${volatility.toFixed(1)}%). This is normal, but monitor for patterns.`,
    });
  } else {
    insights.push({
      type: "POSITIVE",
      message: "🎯 Stable mood pattern",
      detail:
        "Your wellness scores are consistent, showing good emotional stability.",
    });
  }

  if (velocityPercent > 5 && currentScore >= 0.6) {
    alerts.push({
      type: "CRITICAL",
      severity: "critical",
      message: "🚨 CRITICAL: High risk with worsening trend",
      detail: `Score: ${(currentScore * 100).toFixed(2)} (${riskLevel}) and rapidly increasing. You may need immediate support.`,
      action: "Contact a mental health professional or crisis hotline",
    });
  } else if (velocityPercent > 3 && currentScore >= 0.5 && volatility > 25) {
    alerts.push({
      type: "URGENT",
      severity: "high",
      message: "⚠️ Multiple risk factors detected",
      detail:
        "Declining scores with unstable mood patterns suggest heightened risk.",
      action:
        "Schedule a check-in with a counselor or take clinical assessments",
    });
  }

  if (velocityPercent > 4 && currentScore < 0.6) {
    alerts.push({
      type: "EARLY_WARNING",
      severity: "medium",
      message: "💡 Early warning",
      detail: `While your current score (${(currentScore * 100).toFixed(2)}) is moderate, the rapid increase suggests risk may escalate soon.`,
      action: "Proactive intervention recommended - take stress/anxiety quiz",
    });
  }

  if (previousScore >= 0.65 && currentScore < 0.5 && velocityPercent < -2) {
    insights.push({
      type: "RECOVERY",
      message: "🌱 Recovery progress",
      detail:
        "You're successfully moving away from high-risk levels. Excellent progress!",
      action: "Continue current interventions and self-care practices",
    });
  }

  if (previousScore < 0.45 && currentScore >= 0.55 && velocityPercent > 3) {
    alerts.push({
      type: "RELAPSE_WARNING",
      severity: "medium",
      message: "⚠️ Possible relapse pattern",
      detail: "After a period of improvement, scores are rising again.",
      action: "Review what changed recently - stress, sleep, medication, etc.",
    });
  }

  return { insights, alerts };
};

export const calculateOverallRisk = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    // Check cache first
    const cacheKey = cacheKeys.riskDaily(userId, today);
    const cachedRisk = await getCache(cacheKey);
    if(cachedRisk) {
      return res.json(cachedRisk);
    }

    let todayRisk = await RiskScore.findOne({ user: userId, date: today });

    if (!todayRisk) {
      todayRisk = new RiskScore({
        user: userId,
        date: today,
      });
    }

    const previous = await RiskScore.findOne({
      user: userId,
      date: { $lt: today },
    }).sort({ date: -1 });

    const previousScore = previous ? previous.overall_score : null;

    const todayDailyQuiz = await DailyQuiz.findOne({
      userId: userId,
      quizType: "daily",
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
      },
    });

    const dailyQuizScores = todayDailyQuiz?.scores || null;
    const proxyScores = calculateProxyFromDailyQuiz(dailyQuizScores);

    const depressionData = await getClinicalScore(
      userId,
      "depression",
      today,
      proxyScores,
    );
    const anxietyData = await getClinicalScore(
      userId,
      "anxiety",
      today,
      proxyScores,
    );
    const stressData = await getClinicalScore(
      userId,
      "stress",
      today,
      proxyScores,
    );
    const sleepData = await getClinicalScore(
      userId,
      "sleep",
      today,
      proxyScores,
    );

    const scores = {
      depression_quiz_score: depressionData.score,
      anxiety_quiz_score: anxietyData.score,
      stress_quiz_score: stressData.score,
      sleep_quiz_score: sleepData.score,
      journal_score: todayRisk.journal_score || 0,
      chatbot_score: todayRisk.chatbot_score || 0,
      quiz_score: todayDailyQuiz?.finalScore || todayRisk.quiz_score || 0,
      community_score: todayRisk.community_score
        ? 1 - todayRisk.community_score
        : 0,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const [key, weight] of Object.entries(RISK_WEIGHTS)) {
      if (scores[key]) {
        weightedSum += scores[key] * weight;
        totalWeight += weight;
      }
    }

    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const riskLevel = getRiskLevel(overallScore);
    const trend = getTrend(overallScore, previousScore);
    const topFactors = getTopFactors(scores);
    const recommendations = getRecommendations(topFactors);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentScores = await RiskScore.find({
      user: userId,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0], $lte: today },
      overall_score: { $ne: null },
    }).sort({ date: 1 });

    let velocity = 0;
    let volatility = 0;

    if (recentScores.length >= 2) {
      const scoreValues = recentScores.map((r) => r.overall_score);

      let totalChange = 0;
      for (let i = 1; i < scoreValues.length; i++) {
        totalChange += scoreValues[i] - scoreValues[i - 1];
      }
      velocity = totalChange / (scoreValues.length - 1);

      const mean =
        scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length;
      const variance =
        scoreValues.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
        scoreValues.length;
      const stdDev = Math.sqrt(variance);
      volatility = mean > 0 ? (stdDev / mean) * 100 : 0;
    }

    const { insights, alerts } = generateInsights(
      velocity,
      volatility,
      overallScore,
      previousScore,
      riskLevel,
    );

    await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        depression_quiz_score: depressionData.score,
        depression_quiz_date: depressionData.date,
        anxiety_quiz_score: anxietyData.score,
        anxiety_quiz_date: anxietyData.date,
        stress_quiz_score: stressData.score,
        stress_quiz_date: stressData.date,
        sleep_quiz_score: sleepData.score,
        sleep_quiz_date: sleepData.date,
        journal_score: todayRisk.journal_score,
        chatbot_score: todayRisk.chatbot_score,
        quiz_score: scores.quiz_score,
        community_score: todayRisk.community_score,
        overall_score: overallScore,
        risk_level: riskLevel,
        top_factors: topFactors,
        previous_score: previousScore,
        trend: trend,
      },
      { upsert: true, new: true },
    );

    const response = {
      daily: {
        score: parseFloat((overallScore * 100).toFixed(2)),
        level: riskLevel,
        trend: trend,
        top_factors: topFactors,
        recommendations: recommendations,
      },
      insights: insights,
      alerts: alerts,
      pattern_analysis: {
        velocity_interpretation:
          velocity > 0 ? "Worsening" : velocity < 0 ? "Improving" : "Stable",
        mood_stability:
          volatility > 30
            ? "Unstable"
            : volatility > 20
              ? "Moderate"
              : "Stable",
        early_intervention_needed: alerts.some(
          (a) => a.severity === "high" || a.severity === "critical",
        ),
      },
    };

    // Cache for 1 hour
    await setCache(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    console.error("Error calculating risk:", error);
    res.status(500).json({ error: error.message });
  }
};

export const weeklyInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check cache first
    const cacheKey = cacheKeys.riskWeekly(userId);
    const cachedData = await getCache(cacheKey);
    if(cachedData) {
      return res.json(cachedData);
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = sevenDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const dailyScores = await RiskScore.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .select(
        "date overall_score depression_quiz_score anxiety_quiz_score stress_quiz_score sleep_quiz_score risk_level",
      );

    if (!dailyScores || dailyScores.length === 0) {
      return res.status(404).json({
        message: "No data available for the past week",
      });
    }

    const totalDays = dailyScores.length;
    const avgScore =
      dailyScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) /
      totalDays;

    let trend = "stable";
    if (totalDays >= 2) {
      const firstScore = dailyScores[0].overall_score;
      const lastScore = dailyScores[totalDays - 1].overall_score;

      if (lastScore < firstScore - 0.1) trend = "improving";
      else if (lastScore > firstScore + 0.1) trend = "declining";
    }

    const chartData = dailyScores.map((day) => ({
      date: day.date,
      overall: parseFloat(((day.overall_score || 0) * 100).toFixed(2)),
      depression: parseFloat(
        ((day.depression_quiz_score || 0) * 100).toFixed(2),
      ),
      anxiety: parseFloat(((day.anxiety_quiz_score || 0) * 100).toFixed(2)),
      stress: parseFloat(((day.stress_quiz_score || 0) * 100).toFixed(2)),
      sleep: parseFloat(((day.sleep_quiz_score || 0) * 100).toFixed(2)),
      level: day.risk_level,
    }));

    const response = {
      summary: {
        avg_score: parseFloat((avgScore * 100).toFixed(2)),
        trend: trend,
        days_tracked: totalDays,
      },
      chart_data: chartData,
    };

    // Cache for 6 hours
    await setCache(cacheKey, response, 21600);

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const monthlyInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check cache first
    const cacheKey = cacheKeys.riskMonthly(userId);
    const cachedData = await getCache(cacheKey);
    if(cachedData) {
      return res.json(cachedData);
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const monthlyScores = await RiskScore.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .select(
        "date overall_score depression_quiz_score anxiety_quiz_score stress_quiz_score sleep_quiz_score risk_level",
      );

    if (!monthlyScores || monthlyScores.length === 0) {
      return res.status(404).json({
        message: "No data available for the past month",
      });
    }

    const totalDays = monthlyScores.length;
    const avgScore =
      monthlyScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) /
      totalDays;

    const weeklyData = [];
    for (let i = 0; i < monthlyScores.length; i += 7) {
      const weekScores = monthlyScores.slice(i, i + 7);
      const weekAvg =
        weekScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) /
        weekScores.length;

      weeklyData.push({
        week: Math.floor(i / 7) + 1,
        avg_score: parseFloat((weekAvg * 100).toFixed(2)),
        start_date: weekScores[0].date,
        end_date: weekScores[weekScores.length - 1].date,
      });
    }

    let trend = "stable";
    if (totalDays >= 2) {
      const firstScore = monthlyScores[0].overall_score;
      const lastScore = monthlyScores[totalDays - 1].overall_score;

      if (lastScore < firstScore - 0.1) trend = "improving";
      else if (lastScore > firstScore + 0.1) trend = "declining";
    }

    const chartData = monthlyScores.map((day) => ({
      date: day.date,
      overall: parseFloat(((day.overall_score || 0) * 100).toFixed(2)),
      depression: parseFloat(
        ((day.depression_quiz_score || 0) * 100).toFixed(2),
      ),
      anxiety: parseFloat(((day.anxiety_quiz_score || 0) * 100).toFixed(2)),
      stress: parseFloat(((day.stress_quiz_score || 0) * 100).toFixed(2)),
      sleep: parseFloat(((day.sleep_quiz_score || 0) * 100).toFixed(2)),
    }));

    const response = {
      summary: {
        avg_score: parseFloat((avgScore * 100).toFixed(2)),
        trend: trend,
        days_tracked: totalDays,
        consistency: parseFloat(((totalDays / 30) * 100).toFixed(2)),
      },
      weekly_overview: weeklyData,
      chart_data: chartData,
    };

    // Cache for 12 hours
    await setCache(cacheKey, response, 43200);

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
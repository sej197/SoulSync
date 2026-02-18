import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import { setCache, getCache, invalidateQuizCache, cacheKeys } from "../utils/cacheUtils.js";

const submitDailyQuiz = async (req, res) => {
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

    // Cache the quiz result
    await setCache(cacheKeys.dailyQuiz(userId, today), {
      message: "Daily quiz submitted successfully",
      score: quizScore,
      scores: quiz.scores
    }, 86400); // Cache for 24 hours

    // Invalidate quiz history cache
    await invalidateQuizCache(userId);

    res.status(201).json({
      message: "Daily quiz submitted successfully",
      score: quizScore,
      scores: quiz.scores
    });

  } catch (error) {
    console.error("Error submitting daily quiz:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export default submitDailyQuiz;
import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import { setCache, invalidateQuizCache, invalidateRiskCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename3 = fileURLToPath(import.meta.url);
const __dirname3 = dirname(__filename3);

// Load the full question pool to look up options for position-based scoring
const allQuizRaw = readFileSync(join(__dirname3, "../../data/all_quiz.json"), "utf-8");
const allQuizPool = JSON.parse(
  allQuizRaw.split("\n").filter(l => !l.trim().startsWith("//")).join("\n")
);

// Build a map of question text → options for quick lookup
const stressQuestionOptionsMap = {};
allQuizPool.questions
  .filter(q => q.category === "stress")
  .forEach(q => {
    stressQuestionOptionsMap[q.question] = q.options;
  });

const submitStressQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const { answers, questions } = req.body;
    const today = new Date().toISOString().split("T")[0];

    if (!answers || answers.length === 0)
      return res.status(400).json({ message: "At least one answer is required" });

    // Position-based scoring: score = selectedIndex / (options.length - 1)
    let totalScore = 0;
    let validCount = 0;

    for (const ans of answers) {
      let options = null;
      if (questions && Array.isArray(questions)) {
        const q = questions.find(q => q.id === ans.questionId);
        if (q) options = q.options;
      }
      if (!options) {
        options = Object.values(stressQuestionOptionsMap)[ans.questionId - 1];
      }

      if (!options || !ans.answer) {
        console.warn("Could not find options for question:", ans.questionId);
        continue;
      }

      const selectedIndex = options.indexOf(ans.answer);
      if (selectedIndex === -1) {
        console.warn("Answer not found in options:", ans.answer);
        continue;
      }

      const score = options.length > 1 ? selectedIndex / (options.length - 1) : 0;
      totalScore += score;
      validCount++;
    }

    if (validCount === 0) {
      return res.status(400).json({ message: "No valid answers provided" });
    }

    const stressScore = +(totalScore / validCount).toFixed(2);

    const transformedAnswers = answers.map(a => ({
      questionId: a.questionId,
      selectedOptions: [a.answer]
    }));

    await DailyQuiz.create({
      userId,
      quizType: "stress",
      date: new Date(),
      answers: transformedAnswers,
      score: { stressScore },
      finalScore: stressScore
    });

    await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          stress_quiz_score: stressScore,
          stress_quiz_date: today
        }
      },
      { upsert: true, new: true }
    );

    // Cache the result
    await setCache(cacheKeys.quizScore(userId, 'stress', today), {
      message: "Stress quiz submitted successfully",
      stressScore
    }, 86400);

    // Invalidate quiz and risk caches
    await invalidateQuizCache(userId);
    await invalidateRiskCache(userId);

    // Check for badges
    const newlyAwarded = await checkAndAwardBadges(userId, 'quiz');

    res.status(201).json({
      message: "Stress quiz submitted successfully",
      stressScore,
      newlyAwarded
    });

  } catch (error) {
    console.error("Error submitting stress quiz:", error);
    res.status(500).json({ message: "Error submitting stress quiz", error: error.message });
  }
};

export default submitStressQuiz;
import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import { setCache, invalidateQuizCache, invalidateRiskCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the full question pool to look up options for position-based scoring
const allQuizRaw = readFileSync(join(__dirname, "../../data/all_quiz.json"), "utf-8");
const allQuizPool = JSON.parse(
  allQuizRaw.split("\n").filter(l => !l.trim().startsWith("//")).join("\n")
);

// Build a map of question text → options for quick lookup
const questionOptionsMap = {};
allQuizPool.questions
  .filter(q => q.category === "anxiety")
  .forEach(q => {
    questionOptionsMap[q.question] = q.options;
  });

const submitAnxietyQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const { answers, questions } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers must be a non-empty array"
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Position-based scoring: score = selectedIndex / (options.length - 1)
    let totalScore = 0;
    let validCount = 0;

    for (const ans of answers) {
      // Find the options list for this question from the submitted questions or from the pool
      let options = null;
      if (questions && Array.isArray(questions)) {
        const q = questions.find(q => q.id === ans.questionId);
        if (q) options = q.options;
      }
      if (!options) {
        // Fallback: look up by question text if available, or use flat index
        options = Object.values(questionOptionsMap)[ans.questionId - 1];
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
      return res.status(400).json({
        message: "No valid answers provided"
      });
    }

    const anxietyScore = Number((totalScore / validCount).toFixed(2));

    if (isNaN(anxietyScore)) {
      return res.status(400).json({
        message: "Score calculation failed"
      });
    }

    const transformedAnswers = answers.map(a => ({
      questionId: a.questionId,
      selectedOptions: [a.answer]
    }));

    await DailyQuiz.create({
      userId,
      quizType: "anxiety",
      date: new Date(),
      answers: transformedAnswers,
      scores: { anxietyScore },
      finalScore: anxietyScore
    });

    await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          anxiety_quiz_score: anxietyScore,
          anxiety_quiz_date: today
        }
      },
      { upsert: true, new: true }
    );

    // Cache the result
    await setCache(cacheKeys.quizScore(userId, 'anxiety', today), {
      message: "Anxiety quiz submitted successfully",
      anxietyScore
    }, 86400);

    // Invalidate quiz and risk caches
    await invalidateQuizCache(userId);
    await invalidateRiskCache(userId);

    // Check for badges
    const newlyAwarded = await checkAndAwardBadges(userId, 'quiz');

    res.status(201).json({
      message: "Anxiety quiz submitted successfully",
      anxietyScore,
      newlyAwarded
    });

  } catch (error) {
    console.error("Error submitting anxiety quiz:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export default submitAnxietyQuiz;
import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import { setCache, invalidateQuizCache, invalidateRiskCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename4 = fileURLToPath(import.meta.url);
const __dirname4 = dirname(__filename4);

// Load the full question pool to look up options for position-based scoring
const allQuizRaw = readFileSync(join(__dirname4, "../../data/all_quiz.json"), "utf-8");
const allQuizPool = JSON.parse(
  allQuizRaw.split("\n").filter(l => !l.trim().startsWith("//")).join("\n")
);

// Build a map of question text → options for quick lookup
const depressionQuestionOptionsMap = {};
allQuizPool.questions
  .filter(q => q.category === "depression")
  .forEach(q => {
    depressionQuestionOptionsMap[q.question] = q.options;
  });

const submitDepressionQuiz = async (req, res) => {
    try {
        const userId = req.userId;
        const { answers, questions } = req.body;
        const today = new Date().toISOString().split("T")[0];

        if (!answers || answers.length === 0) {
            return res.status(400).json({ message: "At least one answer is required" });
        }

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
                options = Object.values(depressionQuestionOptionsMap)[ans.questionId - 1];
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

        const depressionScore = Number((totalScore / validCount).toFixed(2));

        const transformedAnswers = answers.map(a => ({
            questionId: a.questionId,
            selectedOptions: [a.answer]
        }));

        await DailyQuiz.create({
            userId,
            quizType: "depression",
            date: new Date(),
            answers: transformedAnswers,
            score: {
                depressionScore
            },
            finalScore: depressionScore,
        });

        await RiskScore.findOneAndUpdate(
            { user: userId, date: today },
            {
                $set: {
                    depression_quiz_score: depressionScore,
                    depression_quiz_date: today
                }
            },
            { upsert: true, new: true }
        );

        // Cache the result
        await setCache(cacheKeys.quizScore(userId, 'depression', today), {
            message: "depression quiz submitted successfully",
            depressionScore
        }, 86400);

        // Invalidate quiz and risk caches
        await invalidateQuizCache(userId);
        await invalidateRiskCache(userId);

        // Check for badges
        const newlyAwarded = await checkAndAwardBadges(userId, 'quiz');

        res.status(201).json({
            message: "depression quiz submitted successfully",
            depressionScore,
            newlyAwarded
        });
    } catch (error) {
        console.error("Error submitting depression quiz:", error);
        res.status(500).json({
            message: "Error submitting depression quiz",
            error: error.message
        });
    }
}

export default submitDepressionQuiz;
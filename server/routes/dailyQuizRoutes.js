import express from "express";
const router = express.Router()
import submitDailyQuiz, { 
  getStreakInfo, 
  getStreakLeaderboard, 
  checkQuizEligibility, 
  getStreakStats,
  getAdaptiveQuiz,
  getCategoryQuiz
} from "../controllers/DailyQuizController.js";
import authenticateToken  from "../middleware/authmiddleware.js";
import submitAnxietyQuiz from "../controllers/AnxietyQuizController.js"
import submitDepressionQuiz from "../controllers/DepressionQuizController.js";
import submitSleepQuiz from "../controllers/SleepQuizController.js";
import submitStressQuiz from "../controllers/StressQuizController.js";

// Quiz submission routes
router.post("/submit-dailyquiz", authenticateToken, submitDailyQuiz)
router.post("/submit-anxietyquiz", authenticateToken, submitAnxietyQuiz)
router.post("/submit-depressionquiz", authenticateToken, submitDepressionQuiz)
router.post("/submit-sleepquiz", authenticateToken, submitSleepQuiz)
router.post("/submit-stressquiz", authenticateToken, submitStressQuiz)

// Adaptive quiz route — returns personalised quiz based on previous scores
router.get("/adaptive-quiz", authenticateToken, getAdaptiveQuiz)

// Category quiz route — returns 10 random questions for a specific category
router.get("/category-quiz/:category", authenticateToken, getCategoryQuiz)

// Streak related routes
router.get("/streak", authenticateToken, getStreakInfo)
router.get("/streak/leaderboard", authenticateToken, getStreakLeaderboard)
router.get("/streak/check-eligibility", authenticateToken, checkQuizEligibility)
router.get("/streak/stats", authenticateToken, getStreakStats)

export default router 
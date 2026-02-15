import express from "express";
const router = express.Router()
import submitDailyQuiz from "../controllers/DailyQuizController.js"
import authenticateToken  from "../middleware/authmiddleware.js";
import submitAnxietyQuiz from "../controllers/AnxietyQuizController.js"
import submitDepressionQuiz from "../controllers/DepressionQuizController.js";
import submitSleepQuiz from "../controllers/SleepQuizController.js";
import submitStressQuiz from "../controllers/StressQuizController.js";

router.post("/submit-dailyquiz",authenticateToken,  submitDailyQuiz)
router.post("/submit-anxietyquiz", authenticateToken, submitAnxietyQuiz)
router.post("/submit-depressionquiz", authenticateToken, submitDepressionQuiz)
router.post("/submit-sleepquiz", authenticateToken, submitSleepQuiz)
router.post("/submit-stressquiz", authenticateToken, submitStressQuiz)
export default router 
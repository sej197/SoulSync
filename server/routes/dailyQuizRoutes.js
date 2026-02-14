import express from "express";
const router = express.Router()
import submitDailyQuiz from "../controllers/DailyQuizController.js"
import authenticateToken  from "../middleware/authmiddleware.js";
import submitAnxietyQuiz from "../controllers/AnxietyQuizController.js"
router.post("/submit-dailyquiz",authenticateToken,  submitDailyQuiz)
router.post("/submit-anxietyquiz", authenticateToken, submitAnxietyQuiz)
export default router 
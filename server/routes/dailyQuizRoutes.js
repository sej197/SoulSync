import express from "express";
const router = express.Router()
import submitDailyQuiz from "../controllers/DailyQuizController.js"
router.post("/submit-dailyquiz", submitDailyQuiz)
export default router 
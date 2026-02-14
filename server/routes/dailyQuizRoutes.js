import express from "express";
const router = express.Router()
import submitDailyQuiz from "../controllers/DailyQuizController.js"
import authenticateToken  from "../middleware/authmiddleware.js";
router.post("/submit-dailyquiz",authenticateToken,  submitDailyQuiz)
export default router 
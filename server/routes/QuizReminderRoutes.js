import express from 'express';
import { sendDailyQuizReminders } from '../controllers/QuizReminderController.js';
import { subscribeToReminders } from '../controllers/QuizReminderController.js';
const router = express.Router();

router.post('/send-daily-reminders', async (req, res) => {
    await sendDailyQuizReminders();;
    res.json({success: true, message:"reminders sent!"});
});
router.post('/subscribe/:userId', subscribeToReminders);
export default router
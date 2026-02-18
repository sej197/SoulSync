import DailyQuiz from "../models/DailyQuiz.js";
import User from "../models/User.js";
import webpush from "web-push";

const getUsersForReminders = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const users = await User.find({
        _id: {$nin: await DailyQuiz.find({
            quizType: "daily",
            date: {$gte: todayStart, $lte: todayEnd}
        }).distinct("userId")}
    });
    return users;
}

const sendDailyQuizReminders = async () => {
    const usersToNotify = await getUsersForReminders();
    for(let user of usersToNotify) {
        if(user.pushSubscription) {
            try {
                await webpush.sendNotification()
                user.pushSubscription, JSON.stringify({
                    title: "Daily Quiz Reminder",
                    body: "Hey! You haven’t taken your daily mental health quiz today 😊"
                    
                })
            } catch (error) {
                console.error("Error sending push notification to user", user._id, error);
            }
        }
    }
}
 const   subscribeToReminders = async(req, res) => {
    try {
        const { userId } = req.params;
        const subscription = req.body;

       
        return res.status(201).json({ success: true, message: "Subscribed to daily reminders" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export {sendDailyQuizReminders, getUsersForReminders, subscribeToReminders};

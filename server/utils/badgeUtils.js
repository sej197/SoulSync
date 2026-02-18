import User from "../models/User.js";
import Journal from "../models/Journal.js";
import DailyQuiz from "../models/DailyQuiz.js";
import UserChat from "../models/Botuserchat.js";
import { invalidateUserCache } from "./cacheUtils.js";

export const BADGES = {
    // ... existing BADGES object ...
    // Journaling Badges
    FIRST_JOURNAL: {
        id: "first_journal",
        name: "First Reflection",
        description: "Write your first journal entry",
        criteria: async (userId) => {
            const count = await Journal.countDocuments({ user: userId });
            return count >= 1;
        }
    },
    JOURNAL_STREAK_3: {
        id: "journal_streak_3",
        name: "Consistent Reflector",
        description: "Write journal entries for 3 consecutive days",
        criteria: async (userId) => {
            const user = await User.findById(userId);
            return (user.streak || 0) >= 3;
        }
    },
    JOURNAL_MASTER: {
        id: "journal_master",
        name: "Journal Master",
        description: "Write 10 journal entries",
        criteria: async (userId) => {
            const count = await Journal.countDocuments({ user: userId });
            return count >= 10;
        }
    },

    // Quiz Badges
    FIRST_QUIZ: {
        id: "first_quiz",
        name: "Self-Aware",
        description: "Complete your first daily quiz",
        criteria: async (userId) => {
            const count = await DailyQuiz.countDocuments({ userId });
            return count >= 1;
        }
    },
    QUIZ_WARRIOR: {
        id: "quiz_warrior",
        name: "Quiz Warrior",
        description: "Complete 5 daily quizzes",
        criteria: async (userId) => {
            const count = await DailyQuiz.countDocuments({ userId });
            return count >= 5;
        }
    },

    // Chatbot Badges
    ICEBREAKER: {
        id: "icebreaker",
        name: "Icebreaker",
        description: "Start your first conversation with the chatbot",
        criteria: async (userId) => {
            const userChat = await UserChat.findOne({ userId });
            return userChat && userChat.chats.length >= 1;
        }
    },
    CHAT_OPEN: {
        id: "chat_open",
        name: "Open Book",
        description: "Have 5 different conversations with the chatbot",
        criteria: async (userId) => {
            const userChat = await UserChat.findOne({ userId });
            return userChat && userChat.chats.length >= 5;
        }
    }
};

export const checkAndAwardBadges = async (userId, actionType) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const newlyAwarded = [];
        const currentBadges = user.badges || [];

        for (const badgeKey in BADGES) {
            const badge = BADGES[badgeKey];
            if (!currentBadges.includes(badge.id)) {
                const metCriteria = await badge.criteria(userId);
                if (metCriteria) {
                    user.badges.push(badge.id);
                    newlyAwarded.push({
                        id: badge.id,
                        name: badge.name,
                        description: badge.description
                    });
                }
            }
        }

        if (newlyAwarded.length > 0) {
            await user.save();
            await invalidateUserCache(userId);
            console.log(`Awarded badges to user ${userId}: ${newlyAwarded.map(b => b.id).join(", ")}`);
        }

        return newlyAwarded;
    } catch (error) {
        console.error("Error in checkAndAwardBadges:", error);
        return [];
    }
};

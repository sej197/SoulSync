import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastQuizDate: {
        type: Date,
        default: null
    },
    totalQuizzesCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    streakBreakDate: {
        type: Date,
        default: null
    },
    // Track when streaks were achieved
    streakMilestones: {
        type: [{
            milestone: Number, // 7, 14, 30, etc.
            achievedDate: Date
        }],
        default: []
    }
}, { timestamps: true });

// Index for efficient querying
streakSchema.index({ userId: 1 });
streakSchema.index({ currentStreak: -1 }); // For leaderboard

export default mongoose.model("Streak", streakSchema);

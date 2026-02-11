import mongoose from "mongoose";
import dailyQuizSchema from "./DailyQuiz.js";
import journalEntrySchema from "./Journal.js";

const userSchema = new mongoose.Schema(
  {
    gender: String,
    contact: String,
    email: { type: String, unique: true, required: true },
    age: Number,
    username: { type: String, unique: true },
    emergency_contacts: [String],
    communities: [String],
    badges: [String],
    streak: { type: Number, default: 0 },
    password: { type: String, required: true },
    status: { type: String, default: "active" },
    dailyQuizzes: [dailyQuizSchema],
    journals: [journalEntrySchema], 
    //episodes

    insights_cache: {
        last_updated: { type: Date, default: null },
        
        // Current risk (with decay if needed)
        current_risk: {
            score: { type: Number, default: 50 },
            level: { type: String, default: 'MODERATE' },
            last_data_date: { type: String, default: null }
        },
        
        // Quick stats
        total_days_tracked: { type: Number, default: 0 },
        current_streak: { type: Number, default: 0 },
        longest_streak: { type: Number, default: 0 },
        
        // Episode info
        active_episode: { type: Boolean, default: false },
        total_episodes: { type: Number, default: 0 }
    }
  }
);

export default mongoose.model("User", userSchema);

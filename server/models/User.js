import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    gender: { type: String, required: true },
    contact: { type: String, required: true ,match: [/^\d{10}$/, "Contact must be 10 digits"]},
    email: { type: String, unique: true, required: true },
    age: Number,
    admin: {type: Boolean, default: false},
    username: { type: String, unique: true },
    emergency_contacts: { type: [String], required: true },
    communities: [String],
    badges: [String],
    streak: { type: Number, default: 0 },
    password: { type: String, required: true },
    status: { type: String, default: "active" },
    dailyQuizzes: [{type: mongoose.Schema.Types.ObjectId, ref: "DailyQuiz"}],
    journals: [{type: mongoose.Schema.Types.ObjectId, ref: "Journal"}], 
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

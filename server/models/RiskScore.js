import mongoose from "mongoose";
const riskScoreSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    
    journal_score: { 
        type: Number, default: null 
    },
    quiz_score: { 
        type: Number, 
        default: null 
    },
    chatbot_score: { 
        type: Number, 
        default: null 
    },
    community_score: { 
        type: Number, 
        default: null 
    },

    stress_quiz_score: {
        type: Number,
        default: null
    },
    
    stress_quiz_date: {
        type: String,
        default: null
    },

    sleep_quiz_score: {
        type: Number,
        default: null
    },

    sleep_quiz_date: {
        type: String,
        default: null
    },

    depression_quiz_score: {
        type: Number,   
        default: null
    },

    depression_quiz_date: {
        type: String,
        default: null
    },

    anxiety_quiz_score: {
        type: Number,
        default: null
    },
    
    anxiety_quiz_date: {
        type: String,
        default: null
    },
    
    overall_score: { 
        type: Number, 
        required: true 
    },
    
    risk_level: { 
        type: String, 
        enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    },

    top_factors: [{ 
        type: String 
        // Example: ["Low mood (3/10)", "Poor sleep (5hrs)", "No community activity"]
    }],
    
    previous_score: { 
        type: Number,
        default: null 
    },
    trend: { 
        type: String,
        enum: ['improving', 'stable', 'declining', 'unknown'],
        default: 'unknown'
    },
    
    created_at: { 
        type: Date, 
        default: Date.now 
    }
}, {
    // Auto-create index for faster queries
    indexes: [
        { user: 1, date: 1 }, // Find user's score for specific date
        { user: 1, created_at: -1 } // Get user's history
    ]
});

riskScoreSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("RiskScore", riskScoreSchema);
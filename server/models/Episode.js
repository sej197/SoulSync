import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    
    episode_type: { 
        type: String,
        enum: ['depression', 'anxiety', 'stress', 'sleep_issues', 'general'],
        required: true 
    },
    
    start_date: { type: String, required: true },
    end_date: { type: String, default: null },   
    is_ongoing: { type: Boolean, default: true },
    
    duration_days: { type: Number, default: 0 },
    
    peak_score: { type: Number, required: true },
    average_score: { type: Number, default: 0 },
    lowest_score: { type: Number, default: 100 },
    
    triggers: [{ type: String }],
    
    daily_scores: [{
        date: String,
        score: Number
    }],
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, {
    indexes: [
        { user: 1, is_ongoing: 1 },
        { user: 1, start_date: -1 }
    ]
});

export default mongoose.model("Episode", episodeSchema);
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
  }
);

export default mongoose.model("User", userSchema);

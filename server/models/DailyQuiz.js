import mongoose from "mongoose"

const dailyQuizSchema = new mongoose.Schema({
    date: { type: String, required: true },
    score: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
})

export default mongoose.model("DailyQuiz", dailyQuizSchema);
import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
    day: String,
    date: String,
    text: String,
    time: String,
    huggingface_score: Number
})

export default mongoose.model("JournalEntry", journalEntrySchema);



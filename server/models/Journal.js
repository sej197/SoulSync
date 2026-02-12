import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
    day: String,
    date: String,
    text: String,
    time: String,
    score: Number
})

export default mongoose.model("JournalEntry", journalEntrySchema);



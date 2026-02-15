import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    entryTime: {
      type: Date,
      default: Date.now
    },
    
    subject: {
        type: String,
        required: false,
        trim: true,
        default: null,
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    
    sentimentScore: {
      type: Number,        // NLP model output
      default: null
    },

  },
  { timestamps: true }
);


journalSchema.index({ user: 1}, {entryTime: -1}); // For fetching recent entries per user

export default mongoose.model("Journal", journalSchema);

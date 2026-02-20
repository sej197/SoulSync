import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    hate_speech_flag: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient pagination queries
chatMessageSchema.index({ community: 1, createdAt: -1 });

export default mongoose.model("ChatMessage", chatMessageSchema);

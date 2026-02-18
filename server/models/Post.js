import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { _id: true } // Each comment has its own ID
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    comments: [commentSchema],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    downvotes: [{   
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    saved_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    hate_speech_flag: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Post", postSchema);

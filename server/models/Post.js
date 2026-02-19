import mongoose from "mongoose";
import commentSchema from "../models/Comment.js";

const postSchema = new mongoose.Schema({
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
    title: {
      type: String,
      trim:true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    comments: [commentSchema],
    commentCount: {
      type: Number,
      default: 0
    },
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
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Post", postSchema);

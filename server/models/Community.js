import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // No duplicate community names
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    member_count: {
      type: Number,
      default: 0
    },
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    is_private: {
      type: Boolean,
      default: false // public by default
    },
    pending_requests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
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

export default mongoose.model("Community", communitySchema);

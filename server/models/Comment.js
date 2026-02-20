import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
    {
    author:{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    text:{ 
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

export default commentSchema;
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
    }
  },
  {
    timestamps: true   
  }
);

export default commentSchema;
import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
    questionId:{
        type:Number,
        required: true
    },
    //this is for single choice 
    selectedOption:{
        type:String
    },
    //for multiple choice
    selectedOptions:{
        type:[String]
    },
    //for one line / paragraph
    textAnswer:{
        type:String
    }, 
    //NLP result only for text ques 
    sentimentScore:{
        type:Number,
        min:-1,
        max:1
    }
}, {_id:false})

const dailyQuizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Identify quiz type
    quizType: {
      type: String,
      enum: ["daily", "anxiety", "depression", "stress", "sleep"],
      default: "daily",
      index: true
    },
    date:{
        type:Date,
        required:true
    },
    answers: {
        type: [answerSchema],
        required: true,
        validate: {
        validator: function (v) {
            return v.length > 0;
        },
        message: "At least one answer is required"
        }
    },

    scores:{
        mentalHealthScore: { type: Number, default: 0 },
        stressScore: { type: Number, default: 0 },
        sleepScore: { type: Number, default: 0 },
        socialScore: { type: Number, default: 0 },
        reflectionScore: { type: Number, default: 0 },
        paragraphScore: { type: Number, default: 0 }
    },
    finalScore:{
        type:Number
    }, 
    
   

}, {timestamps: true});
dailyQuizSchema.index(
  { userId: 1, quizType: 1, date: 1 },
  { unique: true }
);
dailyQuizSchema.index({userId:1, date:1}, {unique:true});
export default mongoose.model("DailyQuiz", dailyQuizSchema);
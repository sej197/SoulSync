import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
const submitDepressionQuiz = async (req, res) => {
    try {
        const userId = req.userId;
        const {answers} = req.body;
         const today = new Date().toISOString().split("T")[0]
         const optionScores = {
            "Not at all": 0,
            "Slightly": 0.25,
            "Moderately": 0.5,
            "Very low": 0.75,
            "Extremely low": 1,

            "No": 0,
            "A little": 0.25,
            "Somewhat": 0.5,
            "Mostly": 0.75,
            "Completely": 1,

            "Normal": 0,
            "Slightly low": 0.25,
            "Moderate": 0.5,
            "Low": 0.75,
            "Very low": 1,

            "Not at all": 0,
            "Sometimes": 0.5,
            "Often": 0.75,
            "Always": 1,

            "Very motivated": 0,
            "Somewhat motivated": 0.25,
            "Neutral": 0.5,
            "Low motivation": 0.75,
            "No motivation": 1,

            "Very hopeful": 0,
            "Somewhat hopeful": 0.25,
            "Neutral": 0.5,
            "Low hope": 0.75,
            "No hope at all": 1,

            "Very good": 0,
            "Good": 0.25,
            "Okay": 0.5,
            "Low": 0.75,
            "Very low": 1
        };
        let totalScore = 0;
        let questionCount = 0;
        for(let i = 0; i < answers.length; i++){
            const userAnswer = answers[i].answer;
            totalScore += optionScores[userAnswer] || 0;
            questionCount++;
        }
        const depressionScore = Number((totalScore / questionCount).toFixed(2));
        const transformedAnswers = answers.map(a => ({
            questionId: a.questionId,
            selectedOptions: [a.answer] 
        }));
        await DailyQuiz.create({
            userId, 
            quizType: "depression",
            date: new Date(),
            answers:transformedAnswers,
            score:{
                depressionScore
            },
            finalScore : depressionScore,
        })
         await RiskScore.findOneAndUpdate(
              { user: userId, date: today },
              {
                $set: {
                    depression_quiz_score: depressionScore,
                    depression_quiz_date: today
                }
              },
              { upsert: true, new: true }
            );
        res.status(201).json({
            message:"depression quiz submitted successfully",
            depressionScore
        })
    } catch (error) {
        console.error("Error submitting depression quiz:", error);
        res.status(500).json({
            message: "Error submitting depression quiz",
            error: error.message
        });
    }
}
export default submitDepressionQuiz;
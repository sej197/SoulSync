import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
import { setCache, invalidateQuizCache, cacheKeys } from "../utils/cacheUtils.js";

const submitSleepQuiz = async (req, res) => {
    try {
        const userId = req.userId;
        const { answers } = req.body;
        
        if(!answers || answers.length === 0){
            return res.status(400).json({
                message:"atleast one answer is required"
            })
        }
        
        const today = new Date().toISOString().split("T")[0]
        
        const optionScores = {
            "Very well": 0,
            "Well": 0.25,
            "Okay": 0.5,
            "Poor": 0.75,
            "Very poor": 1,

            "Less than 4 hrs": 1,
            "4–5 hrs": 0.75,
            "5–6 hrs": 0.5,
            "6–7 hrs": 0.25,
            "More than 7 hrs": 0,

            "Not at all": 0,
            "Once": 0.25,
            "Twice": 0.5,
            "Three times": 0.75,
            "Multiple times": 1,

            "Fully rested": 0,
            "Mostly rested": 0.25,
            "Somewhat rested": 0.5,
            "Slightly rested": 0.75,
            "Not at all": 1,

            "Never": 0,
            "Rarely": 0.25,
            "Sometimes": 0.5,
            "Often": 0.75,
            "Always": 1,

            "None": 0,
            "Mild": 0.25,
            "Moderate": 0.5,
            "Severe": 0.75,
            "Extremely severe": 1,

            "Very consistent": 0,
            "Mostly consistent": 0.25,
            "Somewhat consistent": 0.5,
            "Rarely consistent": 0.75,
            "Not consistent at all": 1,

            "Excellent": 0,
            "Good": 0.25,
            "Average": 0.5,
            "Poor": 0.75,
            "Very poor": 1
        };
        
        let totalScore = 0;
        let questionCount = 0;
        
        for(let i = 0; i < answers.length; i++){
            const userAnswer = answers[i].answer;
            totalScore += optionScores[userAnswer] || 0;
            questionCount++;
        }
        
        const sleepScore = Number((totalScore / questionCount).toFixed(2));
        
        const transformedAnswers = answers.map(a => ({
            questionId: a.questionId,
            selectedOptions: [a.answer] 
        }));
        
        await DailyQuiz.create({
            userId, 
            quizType: "sleep",
            date: new Date(),
            answers:transformedAnswers,
            score:{
                sleepScore
            },
        });
        
        await RiskScore.findOneAndUpdate(
            { user: userId, date: today },
            {
                $set: {
                    sleep_quiz_score: sleepScore,   
                    sleep_quiz_date: today
                }
            },
            { upsert: true, new: true }
        );

        // Cache the result
        await setCache(cacheKeys.quizScore(userId, 'sleep', today), {
            message:"Sleep quiz submitted successfully",
            sleepScore
        }, 86400);

        // Invalidate quiz cache
        await invalidateQuizCache(userId);

        res.status(200).json({
            message:"Sleep quiz submitted successfully",
            sleepScore
        })
    } catch (error) {
        console.error("Error submitting sleep quiz:", error);
        res.status(500).json({
            message: "Error submitting sleep quiz",
            error: error.message
        });
    }
}

export default submitSleepQuiz;
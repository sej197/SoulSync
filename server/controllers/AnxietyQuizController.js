import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
const submitAnxietyQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const { answers } = req.body;
    const today = new Date().toISOString().split("T")[0]
    const optionScores = {
      "Not at all": 0,
      "Rarely": 0.25,
      "Sometimes": 0.5,
      "Often": 0.75,
      "Almost all the time": 1,

      "No symptoms": 0,
      "Very mild": 0.25,
      "Mild": 0.5,
      "Strong": 0.75,
      "Very strong": 1,

      "Very easy": 0,
      "Easy": 0.25,
      "Moderate": 0.5,
      "Hard": 0.75,
      "Very hard": 1,

      "Completely relaxed": 0,
      "Slightly restless": 0.25,
      "Moderately restless": 0.5,
      "Very restless": 0.75,
      "Extremely restless": 1,

      "A little": 0.25,
      "Somewhat": 0.5,
      "Very much": 0.75,
      "Extremely overwhelming": 1,

      "Slightly": 0.25,
      "A lot": 0.75,
      "Constantly": 1,

      "Very little": 0.25,
      "Somewhat": 0.5,
      "A lot": 0.75,
      "Completely affected": 1,

      "Fully relaxed": 0,
      "Slightly tense": 0.25,
      "Moderately tense": 0.5,
      "Very tense": 0.75,
      "Extremely tense": 1,

      "Very effective": 0,
      "Mostly effective": 0.25,
      "Somewhat effective": 0.5,
      "Barely effective": 0.75,
      "Not effective at all": 1,

      "Very calm": 0,
      "Mostly calm": 0.25,
      "Moderately anxious": 0.5,
      "Highly anxious": 0.75,
      "Extremely anxious": 1
    };


    let totalScore = 0;
    let questionCount = 0;
    for(let i = 0; i < answers.length; i++) {
      const userAnswer = answers[i].answer;
      totalScore = totalScore + optionScores[userAnswer];
      questionCount++;
    }    
    const anxietyScore = Number((totalScore / questionCount).toFixed(2));
    const transformedAnswers = answers.map(a => ({
        questionId: a.questionId,
        selectedOptions: [a.answer] 
    }));
    
    await DailyQuiz.create({
      userId,
      quizType: "anxiety",
      date: new Date(),
      answers:transformedAnswers,
      scores: {
        anxietyScore
      },
      finalScore: anxietyScore
    });
     await RiskScore.findOneAndUpdate(
          { user: userId, date: today },
          {
            $set: {
              anxiety_quiz_score: anxietyScore,
              anxiety_quiz_date: today
            }
          },
          { upsert: true, new: true }
        );
    res.status(201).json({
      message: "anxiety quiz submitted successfully",
      anxietyScore
    });
  } catch (error) {
    console.error("arror submitting anxiety quiz:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export default submitAnxietyQuiz;

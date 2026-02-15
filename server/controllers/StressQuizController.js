import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
const submitStressQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const { answers } = req.body;
    const today = new Date().toISOString().split("T")[0]
    if (!answers || answers.length === 0)
      return res.status(400).json({ message: "At least one answer is required" });

    const questionScores = { 
      1: { "Very low": 0, "Low": 0.25, "Moderate": 0.5, "High": 0.75, "Extreme": 1 },
      2: { "Work or studies": 0.5, "Family": 0.5, "Money": 0.75, "Health": 0.75, "Time pressure": 0.5 },
      3: { "Never": 0, "Rarely": 0.25, "Sometimes": 0.5, "Often": 0.75, "Always": 1 },
      4: { "Not at all": 0, "Slightly": 0.25, "Somewhat": 0.5, "Mostly": 0.75, "Completely": 1 },
      5: { "None": 0, "Mild": 0.25, "Moderate": 0.5, "Severe": 0.75, "Extremely severe": 1 },
      6: { "Never": 1, "Rarely": 0.75, "Sometimes": 0.5, "Often": 0.25, "Always": 0 },
      7: { "Very poorly": 1, "Poorly": 0.75, "Okay": 0.5, "Well": 0.25, "Very well": 0 },
      8: { "Not at all": 0, "Slightly": 0.25, "Somewhat": 0.5, "Mostly": 0.75, "Completely": 1 },
      9: { "Never": 0, "Rarely": 0.25, "Sometimes": 0.5, "Often": 0.75, "Always": 1 },
      10: { "None": 0, "Low": 0.25, "Moderate": 0.5, "High": 0.75, "Extreme": 1 }
    };

    let totalScore = 0;
    answers.forEach(ans => {
      const qId = ans.questionId;
      const val = ans.answer;
      if (questionScores[qId] && questionScores[qId][val] !== undefined)
        totalScore += questionScores[qId][val];
    });

    const stressScore = +(totalScore / answers.length).toFixed(2);
    const transformedAnswers = answers.map(a => ({
        questionId: a.questionId,
        selectedOptions: [a.answer] 
    }));

    await DailyQuiz.create({
      userId,
      quizType: "stress",
      date: new Date(),
      answers:transformedAnswers,
      score: { stressScore },
      finalScore: stressScore
    });
     await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          stress_quiz_score: stressScore,
          stress_quiz_date: today
        }
      },
      { upsert: true, new: true }
    );
    res.status(201).json({
      message: "Stress quiz submitted successfully",
      stressScore
    });

  } catch (error) {
    console.error("Error submitting stress quiz:", error);
    res.status(500).json({ message: "Error submitting stress quiz", error: error.message });
  }
};

export default submitStressQuiz;

import DailyQuiz from "../models/DailyQuiz.js";

const submitAnxietyQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const { answers } = req.body;

    const optionScores = {
      
      "Not at all": 0,
      "A little": 0.25,
      "Sometimes": 0.5,
      "Often": 0.75,
      "Almost all the time": 1,

      "No symptoms": 0,
      "Sweating": 0.5,
      "Restlessness": 0.6,
      "Difficulty concentrating": 0.6,
      "Fast heartbeat": 0.7,
      "Racing thoughts": 0.7,

      "Moderately": 0.6,
      "Very much": 0.9,

      "No": 0,
      "Slightly": 0.3,
      "Yes": 0.7,
      "Very much": 1,

      "None": 0,
      "Social situations": 0.6,
      "College or work": 0.6,
      "Family issues": 0.6,
      "Health concerns": 0.7,
      "Future uncertainty": 0.7,

      "Yes, several things": 0.9,

      
      "Relaxed": 0,
      "Slight tension": 0.3,
      "Moderate tension": 0.6,
      "Very tense": 0.9,

      
      "Did not need anything": 0,
      "Helped a little": 0.3,
      "Helped moderately": 0.5,
      "Did not help at all": 0.8,

    
      "Very low": 0,
      "Low": 0.25,
      "Moderate": 0.5,
      "High": 0.75,
      "Extreme": 1
    };

    let totalScore = 0;
    let questionCount = 0;

    for (let i = 0; i < answers.length; i++) {
      const selectedOption = answers[i].selectedOption;

      if (!selectedOption) continue;

      const score = optionScores[selectedOption] ?? 0;
      totalScore += score;
      questionCount++;
    }

    const anxietyScore =
      questionCount > 0
        ? Number((totalScore / questionCount).toFixed(2))
        : 0;

    await DailyQuiz.create({
      userId,
      quizType: "anxiety",
      date: new Date(),
      answers,
      scores: {
        anxietyScore
      },
      finalScore: anxietyScore
    });

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

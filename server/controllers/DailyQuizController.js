import DailyQuiz from "../models/DailyQuiz.js";
import RiskScore from "../models/RiskScore.js";
const submitDailyQuiz = async (req, res) => {
  try {
     const userId = req.userId; 
        const today = new Date().toISOString().split("T")[0]

    const { answers } = req.body; 

    const optionScores = {
      // feelings
      "Very good": 0,
      "Okay": 0.25,
      "Neutral": 0.5,
      "Feeling Low": 0.75,
      "Very low": 1,

      // mental state
      "Felt calm": 0,
      "Felt hopeful": 0.1,
      "Nothing specific": 0.2,
      "Felt tired or unmotivated": 0.6,
      "Felt anxious": 0.8,
      "Felt overwhelmed": 1,

      // stress intensity
      "Low": 0,
      "Moderate": 0.25,
      "High": 0.75,
      "Extreme": 1,

      // sleep
      "Very restful": 0,
      "Poor": 0.7,
      "Very poor": 1,

      // energy
      "Very energetic": 0,
      "Normal energy": 0.3,
      "Low energy": 0.6,
      "Very tired": 0.8,
      "Difficulty focusing": 1,

      // family
      "Supportive": 0,
      "Normal": 0.3,
      "Some tension": 0.6,
      "Very stressful": 1,

      // work
      "Motivated": 0,
      "Slightly stressed": 0.6,
      "Very stressed": 1,

      // workload
      "Manageable": 0.2,
      "Heavy but okay": 0.5,
      "Overwhelming": 0.8,
      "Could not keep up": 1,

      // social
      "Very connected": 0,
      "Somewhat connected": 0.3,
      "Isolated": 1,

      // emotional overwhelm
      "No": 0,
      "A little": 0.5,
      "A lot": 1,

      // coping
      "Talking to someone": 0,
      "Listening to music": 0.2,
      "Sleeping": 0.4,
      "Writing or journaling": 0.1,
      "Nothing helped today": 1,
    };

    const getScore = (answer) => {
      if (Array.isArray(answer)) {
        let total = 0;
        answer.forEach((option) => {
          total += optionScores[option] ?? 0.5;
        });
        return total / answer.length;
      }

      if (typeof answer === "string") {
        return optionScores[answer] ?? 0;
      }

      return 0;
    };

    let mental = 0,
      stress = 0,
      sleep = 0,
      social = 0,
      reflection = 0;

    let mentalCount = 0,
      stressCount = 0,
      sleepCount = 0,
      socialCount = 0,
      reflectionCount = 0;

    let paragraphScore = 0;

    for (const ans of answers) {
      const userAnswer =
        ans.selectedOption || ans.selectedOptions || ans.textAnswer;

      if (
        ans.type === "paragraph" &&
        typeof userAnswer === "string" &&
        userAnswer.trim().length > 0
      ) {
        try {
          const response = await fetch(
            `${process.env.PYTHON_SERVER}/sentiment/analyze`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: userAnswer }),
            }
          );

          const data = await response.json();
          paragraphScore = data.paragraphScore ?? 0;
        } catch (error) {
          console.error("Sentiment API error:", error.message);
          paragraphScore = 0;
        }

        continue; // skip category scoring
      }

      const score = getScore(userAnswer);

      switch (ans.category) {
        case "mental_health":
          mental += score;
          mentalCount++;
          break;

        case "stress":
          stress += score;
          stressCount++;
          break;

        case "sleep":
          sleep += score;
          sleepCount++;
          break;

        case "family":
        case "college_job":
        case "social":
          social += score;
          socialCount++;
          break;

        case "safety":
        case "coping":
          reflection += score;
          reflectionCount++;
          break;
      }
    }

    mental = mentalCount ? mental / mentalCount : 0;
    stress = stressCount ? stress / stressCount : 0;
    sleep = sleepCount ? sleep / sleepCount : 0;
    social = socialCount ? social / socialCount : 0;
    reflection = reflectionCount ? reflection / reflectionCount : 0;

    const finalScore = Number(
      (
        (mental +
          stress +
          sleep +
          social +
          reflection +
          paragraphScore) /
        6
      ).toFixed(2)
    );

    const quiz = await DailyQuiz.create({
      userId,
      quizType:"daily",
      date: new Date(),
      answers,
      scores: {
        mentalHealthScore: mental,
        stressScore: stress,
        sleepScore: sleep,
        socialScore: social,
        reflectionScore: reflection,
        paragraphScore: paragraphScore,
      },
      finalScore,
    });
     await RiskScore.findOneAndUpdate(
          { user: userId, date: today },
          {
            $set: {
              quiz_score: finalScore,
              quiz_date: today
            }
          },
          { upsert: true, new: true }
        );
    res.status(201).json({
      message: "quiz submitted successfully",
      // finalScore,
      // paragraphScore   
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default submitDailyQuiz;

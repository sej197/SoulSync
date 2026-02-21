import Survey from "../models/Survey.js";
import User from "../models/User.js";
import { setCache, getCache, cacheKeys } from "../utils/cacheUtils.js";

const submitSurvey = async (req, res) => {
  try {
    const userId = req.userId;

    const existing = await Survey.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ message: "Survey already completed" });
    }

    const {
      gender,
      age,
      city,
      profession,
      academicPressure,
      workPressure,
      cgpa,
      studySatisfaction,
      jobSatisfaction,
      sleepDuration,
      dietaryHabits,
      degree,
      suicidalThoughts,
      workStudyHours,
      financialStress,
      familyHistoryMentalIllness,
    } = req.body;

    if (
      !gender ||
      !age ||
      !city ||
      !profession ||
      !sleepDuration ||
      !dietaryHabits ||
      !suicidalThoughts ||
      workStudyHours === undefined ||
      !financialStress ||
      !familyHistoryMentalIllness
    ) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const survey = new Survey({
      user: userId,
      gender,
      age,
      city,
      profession,
      academicPressure: academicPressure || null,
      workPressure: workPressure || null,
      cgpa: cgpa || null,
      studySatisfaction: studySatisfaction || null,
      jobSatisfaction: jobSatisfaction || null,
      sleepDuration,
      dietaryHabits,
      degree: degree || null,
      suicidalThoughts,
      workStudyHours,
      financialStress,
      familyHistoryMentalIllness,
    });

    await survey.save();

    // Mark survey as completed on user
    await User.findByIdAndUpdate(userId, { surveyCompleted: true });

    // Invalidate user cache so auth status picks up surveyCompleted
    const cachedUser = await getCache(cacheKeys.user(userId));
    if (cachedUser) {
      cachedUser.surveyCompleted = true;
      await setCache(cacheKeys.user(userId), cachedUser, 7200);
    }

    return res.json({ message: "Survey submitted successfully" });
  } catch (error) {
    console.error("Error submitting survey:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSurvey = async (req, res) => {
  try {
    const userId = req.userId;
    const survey = await Survey.findOne({ user: userId });

    if (!survey) {
      return res.json({ completed: false, survey: null });
    }

    return res.json({ completed: true, survey });
  } catch (error) {
    console.error("Error fetching survey:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export { submitSurvey, getSurvey };

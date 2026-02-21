import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Prefer not to say"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 100,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    profession: {
      type: String,
      enum: ["Student", "Working Professional", "Unemployed", "Retired", "Other"],
      required: true,
    },
    academicPressure: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    workPressure: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    studySatisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    jobSatisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    sleepDuration: {
      type: String,
      enum: [
        "Less than 5 hours",
        "5-6 hours",
        "7-8 hours",
        "More than 8 hours",
      ],
      required: true,
    },
    dietaryHabits: {
      type: String,
      enum: ["Healthy", "Moderate", "Unhealthy"],
      required: true,
    },
    degree: {
      type: String,
      trim: true,
      default: null,
    },
    suicidalThoughts: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    workStudyHours: {
      type: Number,
      min: 0,
      max: 24,
      required: true,
    },
    financialStress: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    familyHistoryMentalIllness: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;

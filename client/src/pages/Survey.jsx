import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { submitSurvey } from "../lib/surveyApi";
import { AuthContext } from "../context/AuthContext";

const STEPS = [
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Academic / Work" },
  { id: 3, title: "Lifestyle" },
  { id: 4, title: "Mental Health" },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-bloom-primary dark:focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 dark:focus:ring-bloom-primary/30 outline-none transition-all text-sm";

const labelClass =
  "block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1";

const Survey = () => {
  const navigate = useNavigate();
  const { user, getAuthStatus } = useContext(AuthContext);

  // If survey already completed, redirect to home
  if (user?.surveyCompleted) {
    return <Navigate to="/" replace />;
  }

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    city: "",
    profession: "",
    academicPressure: "",
    workPressure: "",
    cgpa: "",
    studySatisfaction: "",
    jobSatisfaction: "",
    sleepDuration: "",
    dietaryHabits: "",
    degree: "",
    suicidalThoughts: "",
    workStudyHours: "",
    financialStress: "",
    familyHistoryMentalIllness: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isStudent = formData.profession === "Student";
  const isWorking = formData.profession === "Working Professional";

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.gender || !formData.age || !formData.city || !formData.profession) {
          toast.error("Please fill all fields in this step");
          return false;
        }
        break;
      case 2:
        if (isStudent && (!formData.academicPressure || !formData.studySatisfaction)) {
          toast.error("Please fill academic fields");
          return false;
        }
        if (isWorking && (!formData.workPressure || !formData.jobSatisfaction)) {
          toast.error("Please fill work fields");
          return false;
        }
        break;
      case 3:
        if (!formData.sleepDuration || !formData.dietaryHabits || formData.workStudyHours === "") {
          toast.error("Please fill all lifestyle fields");
          return false;
        }
        break;
      case 4:
        if (
          !formData.suicidalThoughts ||
          !formData.financialStress ||
          !formData.familyHistoryMentalIllness
        ) {
          toast.error("Please fill all mental health fields");
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        workStudyHours: Number(formData.workStudyHours),
        financialStress: Number(formData.financialStress),
        academicPressure: formData.academicPressure ? Number(formData.academicPressure) : null,
        workPressure: formData.workPressure ? Number(formData.workPressure) : null,
        cgpa: formData.cgpa ? Number(formData.cgpa) : null,
        studySatisfaction: formData.studySatisfaction ? Number(formData.studySatisfaction) : null,
        jobSatisfaction: formData.jobSatisfaction ? Number(formData.jobSatisfaction) : null,
      };
      await submitSurvey(payload);
      toast.success("Survey submitted! Welcome to SoulSync!");
      await getAuthStatus();
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit survey";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Rating Buttons Component ── */
  const RatingButtons = ({ name, label, max = 5, min = 0 }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2 mt-1">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, [name]: String(val) }))}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
              formData[name] === String(val)
                ? "bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30"
                : "bg-bloom-cream dark:bg-gray-700 text-bloom-primary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-bloom-cream via-white to-bloom-secondary/10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-bloom-primary dark:text-white">
            Welcome to SoulSync
          </h1>
          <p className="text-bloom-muted dark:text-gray-400 text-sm mt-1">
            Help us understand you better by completing this quick survey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s) => (
            <div key={s.id} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  step >= s.id
                    ? "bg-bloom-primary"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
              <p
                className={`text-xs mt-1 text-center ${
                  step >= s.id
                    ? "text-bloom-primary dark:text-bloom-primary font-medium"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {s.title}
              </p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft dark:shadow-gray-900/50 p-6 md:p-8 transition-colors duration-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-bloom-primary dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-bloom-primary/10 dark:bg-bloom-primary/20 rounded-lg flex items-center justify-center text-bloom-primary text-sm font-bold">
                    1
                  </span>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Enter your age"
                      min="13"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Your city"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Profession</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select profession</option>
                      <option value="Student">Student</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Retired">Retired</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Academic / Work ── */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-bloom-primary dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-bloom-primary/10 dark:bg-bloom-primary/20 rounded-lg flex items-center justify-center text-bloom-primary text-sm font-bold">
                    2
                  </span>
                  {isStudent ? "Academic Details" : isWorking ? "Work Details" : "Academic / Work Details"}
                </h2>

                {isStudent && (
                  <div className="space-y-4">
                    <RatingButtons
                      name="academicPressure"
                      label="Academic Pressure (0 = None, 5 = Extreme)"
                    />
                    <div>
                      <label className={labelClass}>CGPA</label>
                      <input
                        type="number"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g. 8.5"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                    <RatingButtons
                      name="studySatisfaction"
                      label="Study Satisfaction (0 = Very Low, 5 = Very High)"
                    />
                    <div>
                      <label className={labelClass}>
                        Degree <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g. B.Tech, MBA, BSc"
                      />
                    </div>
                  </div>
                )}

                {isWorking && (
                  <div className="space-y-4">
                    <RatingButtons
                      name="workPressure"
                      label="Work Pressure (0 = None, 5 = Extreme)"
                    />
                    <RatingButtons
                      name="jobSatisfaction"
                      label="Job Satisfaction (0 = Very Low, 5 = Very High)"
                    />
                  </div>
                )}

                {!isStudent && !isWorking && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-bloom-muted dark:text-gray-400 text-sm">
                      No academic or work questions needed for your profession.
                      <br />
                      Click <strong>Next</strong> to continue.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Lifestyle ── */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-bloom-primary dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-bloom-primary/10 dark:bg-bloom-primary/20 rounded-lg flex items-center justify-center text-bloom-primary text-sm font-bold">
                    3
                  </span>
                  Lifestyle
                </h2>

                <div>
                  <label className={labelClass}>Sleep Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"].map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, sleepDuration: option }))
                          }
                          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            formData.sleepDuration === option
                              ? "bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30"
                              : "bg-bloom-cream dark:bg-gray-700 text-bloom-primary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Dietary Habits</label>
                  <div className="flex gap-3">
                    {["Healthy", "Moderate", "Unhealthy"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, dietaryHabits: option }))
                        }
                        className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.dietaryHabits === option
                            ? "bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30"
                            : "bg-bloom-cream dark:bg-gray-700 text-bloom-primary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Work / Study Hours per Day</label>
                  <input
                    type="number"
                    name="workStudyHours"
                    value={formData.workStudyHours}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 8"
                    min="0"
                    max="24"
                    required
                  />
                </div>
              </div>
            )}

            {/* ── STEP 4: Mental Health ── */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-bloom-primary dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-bloom-primary/10 dark:bg-bloom-primary/20 rounded-lg flex items-center justify-center text-bloom-primary text-sm font-bold">
                    4
                  </span>
                  Mental Health & Wellbeing
                </h2>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    🛡️ Your responses are confidential and used only to personalize your experience.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Have you ever had suicidal thoughts?
                  </label>
                  <div className="flex gap-3">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            suicidalThoughts: option,
                          }))
                        }
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.suicidalThoughts === option
                            ? option === "Yes"
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                              : "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "bg-bloom-cream dark:bg-gray-700 text-bloom-primary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <RatingButtons
                  name="financialStress"
                  label="Financial Stress (1 = Very Low, 5 = Very High)"
                  min={1}
                  max={5}
                />

                <div>
                  <label className={labelClass}>
                    Family History of Mental Illness?
                  </label>
                  <div className="flex gap-3">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            familyHistoryMentalIllness: option,
                          }))
                        }
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.familyHistoryMentalIllness === option
                            ? "bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30"
                            : "bg-bloom-cream dark:bg-gray-700 text-bloom-primary dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-bloom-primary dark:text-gray-300 bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-bloom-primary transition-all"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30 hover:bg-bloom-primary/90 transition-all transform hover:-translate-y-0.5"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-bloom-primary text-white shadow-lg shadow-bloom-primary/30 hover:bg-bloom-primary/90 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Survey ✓"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Survey;

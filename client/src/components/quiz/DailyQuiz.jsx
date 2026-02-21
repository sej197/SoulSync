// src/components/quiz/DailyQuiz.jsx
import React, { useState, useEffect } from "react";
import dailyQuizData from "./dailyCheckinQuiz.json";
import axios from "axios";

const DailyQuiz = ({ userId }) => {
  const [quizData, setQuizData] = useState(dailyQuizData);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState([0]);
  const [adaptations, setAdaptations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch adaptive quiz on mount
  useEffect(() => {
    const fetchAdaptiveQuiz = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/quiz/adaptive-quiz`,
          { withCredentials: true }
        );
        if (res.data && res.data.questions && res.data.questions.length > 0) {
          setQuizData({ quizType: res.data.quizType, questions: res.data.questions });
          setAdaptations(res.data.adaptations || null);
        }
      } catch (error) {
        console.error("Error fetching adaptive quiz, using default:", error);
        // Keep the default static quiz loaded from JSON
      } finally {
        setLoading(false);
      }
    };
    fetchAdaptiveQuiz();
  }, []);

  const handleChange = (questionId, value, type) => {
    setAnswers((prev) => {
      const prevAnswer = prev[questionId] || [];
      if (type === "single_choice") {
        return { ...prev, [questionId]: [value] };
      } else if (type === "multiple_choice") {
        let updated = prevAnswer.includes(value)
          ? prevAnswer.filter((v) => v !== value)
          : [...prevAnswer, value];
        return { ...prev, [questionId]: updated };
      } else {
        return { ...prev, [questionId]: value };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = quizData.questions.map((q) => ({
        questionId: q.id,
        category: q.category,
        type: q.type,
        is_adaptive: q.is_adaptive || false,
        options: q.options || [],
        selectedOption:
          q.type === "single_choice"
            ? answers[q.id]?.[0] ?? null
            : undefined,
        selectedOptions:
          q.type === "multiple_choice" ? answers[q.id] ?? [] : undefined,
        textAnswer: q.type === "paragraph" ? answers[q.id] ?? "" : undefined,
      }));

      // send to backend
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/quiz/submit-dailyquiz`,
        {

          answers: payload,
        },
        { withCredentials: true }
      );

      setFinalScore(res.data.finalScore);
      setSubmitted(true);

      // Show badge notifications
      if (res.data.newlyAwarded && res.data.newlyAwarded.length > 0) {
        res.data.newlyAwarded.forEach(badge => {
          toast.success(`New Badge Earned: ${badge.name}! 🏆`, {
            duration: 5000,
            icon: '🎉',
          });
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const progress = (visitedQuestions.length / quizData.questions.length) * 100;

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions([...visitedQuestions, index]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5F5]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#6A1B9A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#3E2723] font-serif text-lg">Preparing your personalised check-in...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">

        <div className="absolute inset-0 bg-[#F3E5F5]">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFE0B2] rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#B2DFDB] rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFCCBC] rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-2xl w-full">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 md:p-14 border border-white/50">
            <div className="text-center space-y-8">

              <div className="relative mx-auto w-32 h-32">
                <div className="relative w-32 h-32 bg-gradient-to-br from-[#6A1B9A] via-[#8E24AA] to-[#7B1FA2] rounded-full flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-serif text-[#3E2723]">
                  Wonderful!
                </h2>
                <p className="text-xl text-[#5D4037] max-w-md mx-auto font-medium">
                  Your daily wellness check-in has been recorded
                </p>
              </div>

              {/* Score Card */}
              {/* <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-bloom-primary/20 to-bloom-dark/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-bloom-cream via-white to-bloom-cream rounded-2xl p-8 border-2 border-bloom-primary/30 shadow-xl">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-left">
                      <p className="text-sm uppercase tracking-widest text-bloom-muted/70 mb-1 font-semibold">
                        Your Score
                      </p>
                      <p className="text-7xl font-bold bg-gradient-to-r from-bloom-primary via-bloom-dark to-bloom-primary bg-clip-text text-transparent">
                        {finalScore}
                      </p>
                    </div>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-bloom-primary/30 to-transparent"></div>
                    <div className="text-6xl">✨</div>
                  </div>
                </div>
              </div> */}


              <div className="bg-[#F3E5F5] rounded-xl p-6 border border-[#E1BEE7]">
                <p className="text-[#3E2723] font-serif text-lg italic">
                  "Every step forward is a step towards growth" 🌸
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div className="absolute inset-0 bg-[#F3E5F5]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#FFE0B2] rounded-full blur-3xl opacity-60" style={{ animation: 'blob 7s infinite' }}></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#B2DFDB] rounded-full blur-3xl opacity-50" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#FFCCBC] rounded-full blur-3xl opacity-40" style={{ animation: 'blob 7s infinite', animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-3xl md:text-4xl font-serif text-[#3E2723] font-bold">
                Daily Check-in
              </h1>
              <span className="text-2xl">🌿</span>
            </div>
            <p className="text-[#5D4037] text-sm md:text-base font-medium opacity-70">
              Your personal wellness reflection
            </p>
            {adaptations && (() => {
              const categoryMeta = {
                anxiety: { emoji: "😰", label: "anxiety" },
                sleep: { emoji: "🌙", label: "sleep" },
                stress: { emoji: "🔥", label: "stress" },
                depression: { emoji: "🌧️", label: "depression" },
              };
              const adaptedCategories = Object.entries(categoryMeta)
                .filter(([key]) => adaptations[key]?.adapted)
                .map(([, meta]) => meta);
              if (adaptedCategories.length === 0) return null;
              const emojis = adaptedCategories.map(c => c.emoji).join(" ");
              const labels = adaptedCategories.map(c => c.label);
              const labelText = labels.length === 1
                ? labels[0]
                : labels.slice(0, -1).join(", ") + " & " + labels[labels.length - 1];
              return (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-sm text-indigo-700 font-medium">
                  <span>{emojis}</span>
                  <span>Personalised {labelText} questions based on your recent scores</span>
                </div>
              );
            })()}
          </div>


          <div className="mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#3E2723]">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
              <span className="text-xs font-bold text-[#6A1B9A]">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#6A1B9A] rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              >
              </div>
            </div>
          </div>


          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 transform transition-all duration-500" style={{ animation: 'fadeInUp 0.5s ease-out' }}>

            {q.category && (
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F3E5F5] text-[#6A1B9A] text-xs font-bold rounded-full border border-purple-100 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#6A1B9A] rounded-full animate-pulse"></span>
                  {q.category}
                </span>
                {q.is_adaptive && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                    {q.category === "anxiety" ? "😰" : q.category === "stress" ? "🔥" : q.category === "depression" ? "🌧️" : "🌙"} Adaptive
                  </span>
                )}
              </div>
            )}


            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#6A1B9A] rounded-xl flex items-center justify-center shadow-lg transition-transform">
                  <span className="text-white font-bold text-base">
                    {currentQuestion + 1}
                  </span>
                </div>
                <h2 className="flex-1 font-serif text-lg md:text-xl text-[#3E2723] font-bold leading-relaxed pt-1">
                  {q.question}
                </h2>
              </div>
            </div>


            <div className="space-y-3 mb-6">
              {q.type === "single_choice" &&
                q.options.map((opt, idx) => {
                  const isSelected = answers[q.id]?.[0] === opt;
                  return (
                    <label
                      key={opt}
                      className="group relative block cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleChange(q.id, opt, "single_choice")}
                        className="sr-only"
                      />
                      <div
                        className={`relative flex items-center p-3.5 rounded-xl border-2 transition-all duration-300 ${isSelected
                          ? "bg-[#F3E5F5] border-[#6A1B9A] shadow-md scale-[1.01]"
                          : "bg-white/50 border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-sm"
                          }`}
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${isSelected
                            ? "border-[#6A1B9A] bg-[#6A1B9A]"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'scaleIn 0.3s ease-out' }}></div>
                          )}
                        </div>
                        <span
                          className={`text-sm md:text-base transition-colors ${isSelected
                            ? "text-[#3E2723] font-bold"
                            : "text-[#5D4037] font-medium opacity-80 group-hover:opacity-100"
                            }`}
                        >
                          {opt}
                        </span>
                      </div>
                    </label>
                  );
                })}

              {q.type === "multiple_choice" &&
                q.options.map((opt, idx) => {
                  const isSelected = answers[q.id]?.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="group relative block cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={isSelected || false}
                        onChange={() =>
                          handleChange(q.id, opt, "multiple_choice")
                        }
                        className="sr-only"
                      />
                      <div
                        className={`relative flex items-center p-3.5 rounded-xl border-2 transition-all duration-300 ${isSelected
                          ? "bg-[#F3E5F5] border-[#6A1B9A] shadow-md scale-[1.01]"
                          : "bg-white/50 border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-sm"
                          }`}
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${isSelected
                            ? "border-[#6A1B9A] bg-[#6A1B9A]"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ animation: 'scaleIn 0.3s ease-out' }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm md:text-base transition-colors ${isSelected
                            ? "text-[#3E2723] font-bold"
                            : "text-[#5D4037] font-medium opacity-80 group-hover:opacity-100"
                            }`}
                        >
                          {opt}
                        </span>
                      </div>
                    </label>
                  );
                })}

              {q.type === "paragraph" && (
                <div className="relative">
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      handleChange(q.id, e.target.value, "paragraph")
                    }
                    placeholder="Take your time to reflect and share your thoughts..."
                    className="w-full p-4 bg-white/70 border-2 border-purple-100 rounded-xl focus:border-[#6A1B9A] focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none text-[#3E2723] placeholder-[#5D4037]/40 text-sm md:text-base leading-relaxed shadow-inner font-medium"
                    rows={5}
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-[#5D4037] border border-purple-100 font-bold">
                    {answers[q.id]?.length || 0} characters
                  </div>
                </div>
              )}
            </div>


            <div className="flex gap-4 justify-between items-center pt-4 border-t border-purple-100">
              <button
                onClick={() => goToQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${currentQuestion === 0
                  ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white text-[#3E2723] hover:bg-purple-50 shadow-md hover:shadow-lg border border-purple-100"
                  }`}
              >
                <svg
                  className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              {currentQuestion < quizData.questions.length - 1 ? (
                <button
                  onClick={() =>
                    goToQuestion(
                      Math.min(quizData.questions.length - 1, currentQuestion + 1)
                    )
                  }
                  className="group flex items-center gap-2 px-6 py-2.5 bg-[#6A1B9A] hover:bg-[#4A148C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm"
                >
                  Next
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="group flex items-center gap-2 px-6 py-2.5 bg-[#6A1B9A] hover:bg-[#4A148C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm"
                >
                  <span>Submit Check-in</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>


          <div className="mt-6 flex justify-center gap-2">
            {quizData.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentQuestion
                  ? "bg-[#6A1B9A] w-7 shadow-md"
                  : answers[quizData.questions[idx].id]
                    ? "bg-[#3E2723]/50 w-2.5"
                    : "bg-[#E1BEE7] w-2.5"
                  }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DailyQuiz;
// src/components/quiz/DailyQuiz.jsx
import React, { useState } from "react";
import dailyQuizData from "./dailyCheckinQuiz.json";
import axios from "axios";

const DailyQuiz = ({ userId }) => {
  const [quizData] = useState(dailyQuizData);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

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
        {withCredentials: true}
      );

      setFinalScore(res.data.finalScore);
      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
       
        <div className="absolute inset-0 bg-gradient-to-br from-bloom-cream via-white to-bloom-primary/20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-bloom-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-bloom-dark/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bloom-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-2xl w-full">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 md:p-14 border border-white/50">
            <div className="text-center space-y-8">
              
              <div className="relative mx-auto w-32 h-32">
                <div className="relative w-32 h-32 bg-gradient-to-br from-bloom-primary via-bloom-primary to-bloom-dark rounded-full flex items-center justify-center shadow-2xl">
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
                <h2 className="text-5xl md:text-6xl font-serif bg-gradient-to-r from-bloom-primary via-bloom-dark to-bloom-primary bg-clip-text text-transparent">
                  Wonderful!
                </h2>
                <p className="text-xl text-bloom-muted max-w-md mx-auto">
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

              
              <div className="bg-gradient-to-r from-bloom-primary/10 via-transparent to-bloom-primary/10 rounded-xl p-6 border border-bloom-primary/20">
                <p className="text-bloom-dark font-serif text-lg italic">
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
      
      <div className="absolute inset-0 bg-gradient-to-br from-bloom-cream via-white to-bloom-primary/10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-bloom-primary/10 rounded-full blur-3xl" style={{ animation: 'blob 7s infinite' }}></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-bloom-dark/5 rounded-full blur-3xl" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-bloom-primary/5 rounded-full blur-3xl" style={{ animation: 'blob 7s infinite', animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-2xl">🌸</div>
              <h1 className="text-3xl md:text-4xl font-serif bg-gradient-to-r from-bloom-primary via-bloom-dark to-bloom-primary bg-clip-text text-transparent">
                Daily Check-in
              </h1>
              <div className="text-2xl">🌸</div>
            </div>
            <p className="text-bloom-muted text-sm md:text-base">
              Your personal wellness reflection
            </p>
          </div>

          
          <div className="mb-6 bg-white rounded-2xl p-4 shadow-xl border border-white/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-bloom-dark">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
              <span className="text-xs font-semibold text-bloom-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="relative h-2 bg-bloom-cream/50 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-bloom-primary to-bloom-dark rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 transform transition-all duration-500" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            
            {q.category && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-bloom-primary/20 to-bloom-dark/20 text-bloom-dark text-xs font-semibold rounded-full border border-bloom-primary/30 shadow-md">
                  <span className="w-1.5 h-1.5 bg-bloom-primary rounded-full animate-pulse"></span>
                  {q.category}
                </span>
              </div>
            )}

            
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-bloom-primary to-bloom-dark rounded-xl flex items-center justify-center shadow-lg transition-transform">
                  <span className="text-white font-bold text-base">
                    {currentQuestion + 1}
                  </span>
                </div>
                <h2 className="flex-1 font-serif text-lg md:text-xl text-bloom-dark leading-relaxed pt-1">
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
                        className={`relative flex items-center p-3.5 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-bloom-primary/20 to-bloom-dark/10 border-bloom-primary shadow-lg scale-[1.02]"
                            : "bg-white/50 border-bloom-cream hover:border-bloom-primary/50 hover:bg-bloom-cream/30 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-bloom-primary bg-bloom-primary"
                              : "border-bloom-muted/30 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'scaleIn 0.3s ease-out' }}></div>
                          )}
                        </div>
                        <span
                          className={`text-sm md:text-base transition-colors ${
                            isSelected
                              ? "text-bloom-dark font-medium"
                              : "text-bloom-muted group-hover:text-bloom-dark"
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
                        className={`relative flex items-center p-3.5 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-bloom-primary/20 to-bloom-dark/10 border-bloom-primary shadow-lg scale-[1.02]"
                            : "bg-white/50 border-bloom-cream hover:border-bloom-primary/50 hover:bg-bloom-cream/30 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-bloom-primary bg-bloom-primary"
                              : "border-bloom-muted/30 bg-white"
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
                          className={`text-sm md:text-base transition-colors ${
                            isSelected
                              ? "text-bloom-dark font-medium"
                              : "text-bloom-muted group-hover:text-bloom-dark"
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
                    className="w-full p-4 bg-white/70 border-2 border-bloom-cream rounded-xl focus:border-bloom-primary focus:ring-4 focus:ring-bloom-primary/20 outline-none transition-all resize-none text-bloom-dark placeholder-bloom-muted/50 text-sm md:text-base leading-relaxed shadow-inner"
                    rows={5}
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-bloom-cream/80 backdrop-blur-sm rounded-full text-xs text-bloom-muted border border-bloom-primary/20">
                    {answers[q.id]?.length || 0} characters
                  </div>
                </div>
              )}
            </div>

           
            <div className="flex gap-4 justify-between items-center pt-4 border-t border-bloom-cream">
              <button
                onClick={() => goToQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  currentQuestion === 0
                    ? "opacity-40 cursor-not-allowed bg-bloom-cream text-bloom-muted"
                    : "bg-white text-bloom-dark hover:bg-bloom-cream shadow-md hover:shadow-lg"
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
                  className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-bloom-primary to-bloom-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm"
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
                  className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-bloom-primary to-bloom-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm"
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
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentQuestion
                    ? "bg-bloom-primary w-7 shadow-md"
                    : answers[quizData.questions[idx].id]
                    ? "bg-bloom-dark/50 w-2.5"
                    : "bg-bloom-cream w-2.5"
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
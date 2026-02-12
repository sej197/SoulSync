// condn on date of default quizzes eg old data of quiz in monthly
import { RISK_WEIGHTS, RISK_LABELS } from "../config/riskConfig.js";

const scores = {
  depression_quiz_score: 0.6,
  anxiety_quiz_score: 0.4,
  stress_quiz_score: 0.5,
  sleep_quiz_score: 0.7,
  journal_score: 0.3,
  chatbot_score: 0.4,
  quiz_score: 0.5,
  community_score: 0.2
};

const getRiskLevel = (score) => {
    if (score >= 0.70) return "HIGH";
    if (score >= 0.50) return "MODERATE";
    return "LOW";
};

const getTrend = (current, previous = 0.55) => {
    if (current > previous + 0.05) return "declining";
    if (current < previous - 0.05) return "improving";
    return "stable";
};

const getRecommendations = (factors) => {
    // can use llm here to generate personalized recommendations based on top factors
    const recs = [];    
    if (factors.some(f => f.includes("depression"))) {
        recs.push("Consider cognitive behavioral therapy (CBT) or counseling.");
    }
    if (factors.some(f => f.includes("anxiety"))) {
        recs.push("Practice mindfulness and relaxation techniques.");
    }       
    if (factors.some(f => f.includes("stress"))) {
        recs.push("Engage in regular physical activity and stress management.");
    }
    if (factors.some(f => f.includes("sleep"))) {
        recs.push("Maintain a consistent sleep schedule and create a restful environment.");
    }
    return recs;
}
    

export const calculateOverallRisk = async (req, res) => {
    const { userId } = req.params;

    console.log("User ID:", userId);

    // const risk = await Risk.findOne({ user: userId });
    // const scores = {
    //     depression_quiz_score: risk.depression_quiz_score ?? 0,
    //     anxiety_quiz_score: risk.anxiety_quiz_score ?? 0,
    //     stress_quiz_score: risk.stress_quiz_score ?? 0,
    //     sleep_quiz_score: risk.sleep_quiz_score ?? 0,
    //     journal_score: risk.journal_score ?? 0,
    //     chatbot_score: risk.chatbot_score ?? 0,
    //     quiz_score: risk.quiz_score ?? 0,
    //     community_score: risk.community_score ?? 0
    // };


    let totalRisk = 0;
    for (const key in RISK_WEIGHTS) {
        totalRisk += scores[key] * RISK_WEIGHTS[key];
    }

    const level = getRiskLevel(totalRisk);
    const trend = getTrend(totalRisk);
    
    let topFactors = [];
    
    for (const { key, label, threshold } of RISK_LABELS) {
        if (scores[key] >= threshold) {
            const percentage = Math.round(scores[key] * 100);
            topFactors.push(`${label} (${percentage})`);
        }
    }

    const recommendations = getRecommendations(topFactors);


    //risk.top_factors = topFactors;
    res.json({
        daily: {
            score: Math.round(totalRisk * 100),
            level,
            trend,
            top_factors: topFactors,
            recommendations
        }
    });
}



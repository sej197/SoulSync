// condn on date of default quizzes eg old data of quiz in monthly
import { RISK_WEIGHTS, RISK_LABELS } from "../config/riskConfig.js";
import RiskScore from "../models/RiskScore.js";

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
    try {
        const { userId } = req.params;
        console.log("User ID:", userId);
        
        const today = new Date().toISOString().split("T")[0];
        const previous = await RiskScore.findOne({ user: userId }).sort({ created_at: -1 });
        const previousScore = previous ? previous.overall_score : null;
        
        // Calculate total risk
        let totalRisk = 0;
        for (const key in RISK_WEIGHTS) {
            totalRisk += scores[key] * RISK_WEIGHTS[key];
        }
        
        const level = getRiskLevel(totalRisk);
        const trend = getTrend(totalRisk, previousScore);
        
        let topFactors = [];
        
        for (const { key, label, threshold } of RISK_LABELS) {
            if (scores[key] >= threshold) {
                const percentage = Math.round(scores[key] * 100);
                topFactors.push(`${label} (${percentage}%)`); // FIXED: Added backtick
            }
        }
        
        const recommendations = getRecommendations(topFactors);
        
        // Update or create risk score with upsert option
        const updatedRisk = await RiskScore.findOneAndUpdate(
            { user: userId, date: today },
            {
                ...scores,
                overall_score: totalRisk,
                risk_level: level,
                top_factors: topFactors,
                previous_score: previousScore,
                trend
            },
            { 
                upsert: true,  // Create if doesn't exist
                new: true      // Return updated document
            }
        );
        
        console.log("Updated Risk Score:", updatedRisk);
        
        res.json({
            daily: {
                score: Math.round(totalRisk * 100),
                level,
                trend,
                top_factors: topFactors,
                recommendations
            }
        });
    } catch (error) {
        console.error("Error calculating risk:", error);
        res.status(500).json({ error: error.message });
    }
}

export const weeklyInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get last 7 days
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const startDate = sevenDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        
        // Get daily scores for the week
        const dailyScores = await RiskScore.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        })
        .sort({ date: 1 })
        .select('date overall_score depression_quiz_score anxiety_quiz_score stress_quiz_score sleep_quiz_score risk_level');
        
        if (!dailyScores || dailyScores.length === 0) {
            return res.status(404).json({ 
                message: "No data available for the past week" 
            });
        }
        
        // Calculate averages
        const totalDays = dailyScores.length;
        const avgScore = dailyScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) / totalDays;
        
        // Determine trend
        let trend = "stable";
        if (totalDays >= 2) {
            const firstScore = dailyScores[0].overall_score;
            const lastScore = dailyScores[totalDays - 1].overall_score;
            
            if (lastScore < firstScore - 0.1) trend = "improving";
            else if (lastScore > firstScore + 0.1) trend = "declining";
        }
        
        // Format for graphs
        const chartData = dailyScores.map(day => ({
            date: day.date,
            overall: Math.round((day.overall_score || 0) * 100),
            depression: Math.round((day.depression_quiz_score || 0) * 100),
            anxiety: Math.round((day.anxiety_quiz_score || 0) * 100),
            stress: Math.round((day.stress_quiz_score || 0) * 100),
            sleep: Math.round((day.sleep_quiz_score || 0) * 100),
            level: day.risk_level
        }));
        
        res.json({
            summary: {
                avg_score: Math.round(avgScore * 100),
                trend: trend,
                days_tracked: totalDays
            },
            chart_data: chartData
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
}

export const monthlyInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        
        // Get all scores for the month
        const monthlyScores = await RiskScore.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        })
        .sort({ date: 1 })
        .select('date overall_score depression_quiz_score anxiety_quiz_score stress_quiz_score sleep_quiz_score risk_level');
        
        if (!monthlyScores || monthlyScores.length === 0) {
            return res.status(404).json({ 
                message: "No data available for the past month" 
            });
        }
        
        const totalDays = monthlyScores.length;
        const avgScore = monthlyScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) / totalDays;
        
        // Group by week for monthly overview
        const weeklyData = [];
        for (let i = 0; i < monthlyScores.length; i += 7) {
            const weekScores = monthlyScores.slice(i, i + 7);
            const weekAvg = weekScores.reduce((sum, day) => sum + (day.overall_score || 0), 0) / weekScores.length;
            
            weeklyData.push({
                week: Math.floor(i / 7) + 1,
                avg_score: Math.round(weekAvg * 100),
                start_date: weekScores[0].date,
                end_date: weekScores[weekScores.length - 1].date
            });
        }
        
        // Calculate trend
        let trend = "stable";
        if (totalDays >= 2) {
            const firstScore = monthlyScores[0].overall_score;
            const lastScore = monthlyScores[totalDays - 1].overall_score;
            
            if (lastScore < firstScore - 0.1) trend = "improving";
            else if (lastScore > firstScore + 0.1) trend = "declining";
        }
        
        // Daily data for detailed graph
        const chartData = monthlyScores.map(day => ({
            date: day.date,
            overall: Math.round((day.overall_score || 0) * 100),
            depression: Math.round((day.depression_quiz_score || 0) * 100),
            anxiety: Math.round((day.anxiety_quiz_score || 0) * 100),
            stress: Math.round((day.stress_quiz_score || 0) * 100),
            sleep: Math.round((day.sleep_quiz_score || 0) * 100)
        }));
        
        res.json({
            summary: {
                avg_score: Math.round(avgScore * 100),
                trend: trend,
                days_tracked: totalDays,
                consistency: Math.round((totalDays / 30) * 100)
            },
            weekly_overview: weeklyData,
            chart_data: chartData
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
}
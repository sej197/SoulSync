import express from "express";
import { calculateOverallRisk, weeklyInsights, monthlyInsights } from "../controllers/RiskController.js";

const router = express.Router();

router.get("/dailyInsights/:userId", calculateOverallRisk);
router.get("/weeklyInsights/:userId", weeklyInsights);
router.get("/monthlyInsights/:userId", monthlyInsights);

export default router;

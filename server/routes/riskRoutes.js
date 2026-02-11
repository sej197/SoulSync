import express from "express";
import { calculateOverallRisk } from "../controllers/RiskController.js";

const router = express.Router();

router.get("/calculate/:userId", calculateOverallRisk);

export default router;

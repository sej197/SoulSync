import express from "express";
import { submitSurvey, getSurvey } from "../controllers/SurveyController.js";
import userAuth from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/submit", userAuth, submitSurvey);
router.get("/status", userAuth, getSurvey);

export default router;

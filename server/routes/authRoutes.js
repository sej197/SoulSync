import express from "express";
import { register, login, logout, isAuthenticated, updateProfile, sendOtp, resetPassword,verifyOtp, sendPasswordResetOtp } from "../controllers/authController.js"
import userAuth from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", userAuth, logout);
router.get("/is-authenticated", userAuth, isAuthenticated);
router.patch("/update-profile", userAuth, updateProfile);
router.post("/send-otp", userAuth, sendOtp);
router.post("/verify-otp", userAuth, verifyOtp);
router.post("/send-reset-otp", sendPasswordResetOtp);
router.post("/reset-password", resetPassword);

export default router;
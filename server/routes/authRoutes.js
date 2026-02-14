import express from "express";
import {register, login, logout, isAuthenticated, updateProfile} from "../controllers/authController.js"
import userAuth from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", userAuth, logout);
router.get("/is-authenticated", userAuth, isAuthenticated);
router.patch("/update-profile", userAuth, updateProfile);

export default router;
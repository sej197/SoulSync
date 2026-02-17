import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import dailyQuizRoutes from "./routes/dailyQuizRoutes.js";
import chatRoutes from "./routes/chatbotRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/quiz", dailyQuizRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/chatbot", chatRoutes);

// Connect DB & start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`);
    });
});

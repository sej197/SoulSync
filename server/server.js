import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { setupSocket } from "./config/socket.js";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import dailyQuizRoutes from "./routes/dailyQuizRoutes.js";
import chatRoutes from "./routes/chatbotRoutes.js";
import quizReminderRoutes from "./routes/QuizReminderRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import communityRoutes from "./routes/CommunityRoutes.js";
import chatRoomRoutes from "./routes/chatRoomRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import rateLimiter from "./middleware/ratelimiter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Async initialization
(async () => {
  // Setup Socket.IO with Redis adapter
  await setupSocket(server);

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // Middlewares
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(rateLimiter); 

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/risk", riskRoutes);
  app.use("/api/quiz", dailyQuizRoutes);
  app.use("/api/journal", journalRoutes);
  app.use("/api/chatbot", chatRoutes);
  app.use("/api/reminders",quizReminderRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/reminders", quizReminderRoutes);
  app.use("/api/community", communityRoutes);
  app.use("/api/chat", chatRoomRoutes);
  app.use("/api/survey", surveyRoutes);

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR CAPTURED:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  });

  // Connect DB & start server
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
})();
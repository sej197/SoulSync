import express from "express";
import dotenv from "dotenv";
import ImageKit from "imagekit";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userAuth from "./middleware/authmiddleware.js";
import UserChat from "./models/Botuserchat.js";
import Chat from "./models/botchat.js";

import dailyQuizRoutes from "./routes/dailyQuizRoutes.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

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

// Connect DB & start server
app.use("/api/quiz", dailyQuizRoutes)
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`);
    });
});

// Chatbot routes
app.get("/api/upload", userAuth, (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
});

app.post("/api/chats", userAuth, async (req, res) => {
    const userId = req.userId;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Text is required" });

    try {
        // Create new chat
        const newChat = new Chat({
            userId: userId,
            history: [
                {
                    role: "user",
                    parts: [{ text }]
                }
            ]
        });
        await newChat.save();
        const userChat = await UserChat.findOne({ userId });
        if (!userChat) {
            const newUserChat = new UserChat({
                userId,
                chats: [
                    {
                        _id: newChat._id,
                        title: text.substring(0, 30),
                        createdAt: newChat.createdAt
                    }
                ]
            });
            await newUserChat.save();
        } else {
            await UserChat.updateOne(
                { userId },
                {
                    $push: {
                        chats: {
                            _id: newChat._id,
                            title: text.substring(0, 30),
                            createdAt: newChat.createdAt
                        }
                    }
                }
            );
        }

        res.status(201).json({ chatId: newChat._id });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/userchats", userAuth, async (req, res) => {
    const userId = req.userId;
    try {
        const userChat = await UserChat.findOne({ userId });
        if (!userChat) {
            return res.status(200).json({ chats: [] });
        }
        res.status(200).json({ chats: userChat.chats });
    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}); 
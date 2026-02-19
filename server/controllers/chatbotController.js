// j:\sayalee\innovateyou\SoulSync\server\controllers\chatbotController.js
import { encrypt, decrypt } from "../utils/encryption.js";
import UserChat from "../models/Botuserchat.js";
import Chat from "../models/Botchat.js";
import RiskScore from "../models/RiskScore.js";
import axios from "axios";
import { setCache, getCache, deleteCachePattern, invalidateChatCache, cacheKeys } from "../utils/cacheUtils.js";
import { checkAndAwardBadges } from "../utils/badgeUtils.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is NOT set in environment!");
} else {
    console.log("GEMINI_API_KEY is loaded (length: " + process.env.GEMINI_API_KEY.length + ")");
}

const logFile = "c:\\Users\\NOOPUR\\OneDrive\\Desktop\\soulsync\\server\\chatbot_debug.log";
function log(msg) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, formattedMsg);
    } catch (e) { }
    console.log(msg);
}

const LOCAL_RISK_KEYWORDS = [
    "die", "kill myself", "suicide", "end my life", "no reason to live",
    "hurt myself", "self harm", "don't want to live", "killing myself",
    "better off dead", "ending it all", "ending", "no hope"
];

function checkLocalRisk(text) {
    if (!text) return 0;
    const lower = text.toLowerCase();
    for (const kw of LOCAL_RISK_KEYWORDS) {
        if (lower.includes(kw)) return 0.9;
    }
    return 0;
}


// POST /api/chats
export const createChat = async (req, res) => {
    const userId = req.userId;
    const { text } = req.body;
    log(`[createChat] Start. userId: ${userId} text: ${text?.substring(0, 20)}...`);

    if (!text) return res.status(400).json({ message: "Text is required" });

    try {
        console.log("[createChat] Encrypting text...");
        const encryptedText = encrypt(text);
        const newChat = new Chat({
            userId,
            history: [
                {
                    role: "user",
                    parts: [{ text: encryptedText }]
                }
            ]
        });

        console.log("[createChat] Saving new chat...");
        await newChat.save();
        console.log("[createChat] Chat saved. _id:", newChat._id);

        console.log("[createChat] Updating user chat list...");
        const userChat = await UserChat.findOne({ userId });

        if (!userChat) {
            console.log("[createChat] Creating new UserChat record...");
            const newUserChat = new UserChat({
                userId,
                chats: [
                    {
                        _id: newChat._id.toString(),
                        title: encrypt(text.substring(0, 30)),
                        createdAt: newChat.createdAt
                    }
                ]
            });
            await newUserChat.save();
        } else {
            console.log("[createChat] Pushing to existing UserChat record...");
            await UserChat.updateOne(
                { userId },
                {
                    $push: {
                        chats: {
                            _id: newChat._id.toString(),
                            title: encrypt(text.substring(0, 30)),
                            createdAt: newChat.createdAt
                        }
                    }
                }
            );
        }

        console.log("[createChat] Invalidating cache...");
        await invalidateChatCache(userId);

        // Sentiment analysis and risk scoring (Daily Quiz format)
        let sentimentScore = checkLocalRisk(text);
        log(`[createChat] Local risk check: ${sentimentScore}`);

        try {
            if (process.env.PYTHON_SERVER && sentimentScore < 0.7) {
                log("[createChat] Calling sentiment API at: " + process.env.PYTHON_SERVER);
                const response = await axios.post(
                    `${process.env.PYTHON_SERVER}/sentiment/analyze`,
                    { text }
                );
                sentimentScore = Math.max(sentimentScore, response.data.paragraphScore ?? 0);
                log("[createChat] Sentiment Score from API: " + sentimentScore);
            }
        } catch (error) {
            log("[createChat] Sentiment API error: " + error.message);
        }

        const today = new Date().toISOString().split("T")[0];
        try {
            log(`[createChat] Updating RiskScore for user: ${userId} date: ${today}`);
            const riskResult = await RiskScore.findOneAndUpdate(
                { user: userId, date: today },
                {
                    $set: {
                        chatbot_score: sentimentScore,
                    },
                },
                { upsert: true, returnDocument: 'after' }
            );
            log(`[createChat] RiskScore updated: ${riskResult?._id} Score: ${riskResult?.chatbot_score}`);
        } catch (error) {
            log("[createChat] Error updating RiskScore: " + error.message);
        }

        // --- Integrated AI Generation ---
        let aiResponse = "I'm here for you. How are you feeling?";
        try {
            log("[createChat] Generating AI response...");
            const chatModel = model.startChat({ history: [] });
            const result = await chatModel.sendMessage(text);
            aiResponse = result.response.text();
            log("[createChat] AI response generated.");

            // Save bot response to history immediately
            await Chat.updateOne(
                { _id: newChat._id },
                {
                    $push: {
                        history: {
                            role: "model",
                            parts: [{ text: encrypt(aiResponse) }]
                        }
                    }
                }
            );
        } catch (error) {
            log("[createChat] AI Generation error: " + error.message);
        }

        // Check for badges
        const newlyAwarded = await checkAndAwardBadges(userId, 'chat');

        res.status(201).json({
            chatId: newChat._id,
            aiResponse,
            riskAlert: sentimentScore > 0.7,
            alertMessage: sentimentScore > 0.7 ? "We've noticed you might be going through a tough time. Remember, SoulSync is here for you, but please consider reaching out to a professional or a loved one if you feel overwhelmed." : null,
            newlyAwarded
        });

    } catch (error) {
        console.error("[createChat] FATAL ERROR:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// GET /api/userchats
export const getUserChats = async (req, res) => {
    const userId = req.userId;

    try {
        // Check cache first
        const cacheKey = cacheKeys.chatList(userId);
        const cachedChats = await getCache(cacheKey);
        if (cachedChats) {
            return res.status(200).json(cachedChats);
        }

        const userChat = await UserChat.findOne({ userId });

        const response = {
            chats: userChat ? userChat.chats.map(c => ({
                ...c.toObject(),
                title: decrypt(c.title)
            })) : []
        };

        // Cache for 30 minutes
        await setCache(cacheKey, response, 1800);

        res.status(200).json(response);

    } catch (error) {
        log("[getUserChats] FATAL ERROR: " + error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// GET /api/chats/:id
export const getChatById = async (req, res) => {
    const chatId = req.params.id;
    const userId = req.userId;
    log(`[getChatById] Start. chatId: ${chatId} userId: ${userId}`);

    if (chatId === "new" || !mongoose.Types.ObjectId.isValid(chatId)) {
        log("[getChatById] Invalid ID provided: " + chatId);
        return res.status(200).json({ history: [] }); // Fallback for "new" or invalid IDs
    }

    try {
        // Check cache first
        const cacheKey = cacheKeys.chat(chatId);
        const cachedChat = await getCache(cacheKey);
        if (cachedChat) {
            log("[getChatById] Returning cached chat.");
            return res.status(200).json(cachedChat);
        }

        log("[getChatById] Fetching from DB...");
        const chat = await Chat.findOne({
            _id: chatId,
            userId: userId
        });

        if (!chat) {
            log("[getChatById] Chat not found.");
            return res.status(404).json({ message: "Chat not found" });
        }

        log("[getChatById] Decrypting history. Items: " + (chat.history?.length || 0));
        // Decrypt history safely
        const decryptedHistory = (chat.history || []).map(item => ({
            role: item.role === "model" ? "bot" : item.role, // normalize to bot/user
            parts: (item.parts || []).map(p => {
                const decryptedText = p.text ? decrypt(p.text) : "";
                return { text: decryptedText };
            })
        }));

        const decryptedChat = {
            ...chat.toObject(),
            history: decryptedHistory
        };

        log("[getChatById] Caching and sending response.");
        // Cache for 1 hour
        await setCache(cacheKey, decryptedChat, 3600);

        res.status(200).json(decryptedChat);

    } catch (error) {
        log("[getChatById] FATAL ERROR: " + error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// PUT /api/chats/:id
export const updateChat = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const chatId = req.params.id;
        const userId = req.userId;
        log(`[updateChat] Start. chatId: ${chatId} userId: ${userId} question: "${question?.substring(0, 50)}"`);

        if (!question || !answer) {
            return res.status(400).json({ message: "Missing question or answer" });
        }

        log(`[updateChat] Pushing question to history...`);
        const updateResult = await Chat.updateOne(
            { _id: chatId, userId: userId },
            {
                $push: {
                    history: { role: "user", parts: [{ text: encrypt(question) }] }
                }
            }
        );
        log(`[updateChat] Update result: ${JSON.stringify(updateResult)}`);

        // Invalidate caches
        console.log("[updateChat] Invalidating caches...");
        const cacheKey = cacheKeys.chat(chatId);
        await deleteCachePattern(cacheKey);
        await invalidateChatCache(userId);

        // Sentiment analysis (Daily Quiz format)
        let sentimentScore = checkLocalRisk(question);
        log(`[updateChat] Local risk check: ${sentimentScore}`);

        try {
            if (process.env.PYTHON_SERVER && sentimentScore < 0.7) {
                log("[updateChat] Calling sentiment API...");
                const response = await axios.post(
                    `${process.env.PYTHON_SERVER}/sentiment/analyze`,
                    { text: question }
                );
                sentimentScore = Math.max(sentimentScore, response.data.paragraphScore ?? 0);
                log("[updateChat] Sentiment Score from API: " + sentimentScore);
            }
        } catch (error) {
            log("[updateChat] Sentiment API error: " + (error.response?.data?.message || error.message || "Unknown error"));
            if (error.code === 'ECONNREFUSED') log("[updateChat] Connection refused - is python server running?");
        }

        // Update RiskScore
        const today = new Date().toISOString().split("T")[0];
        try {
            log(`[updateChat] Updating RiskScore. Score: ${sentimentScore}`);
            const riskResult = await RiskScore.findOneAndUpdate(
                { user: userId, date: today },
                { $set: { chatbot_score: sentimentScore } },
                { upsert: true, returnDocument: 'after' }
            );
            log(`[updateChat] RiskScore updated: ${riskResult?._id} Score: ${riskResult?.chatbot_score}`);
        } catch (error) {
            log("[updateChat] Error updating RiskScore: " + error.message);
        }

        // --- Integrated AI Generation ---
        let aiResponse = "I understand. Tell me more.";
        try {
            log("[updateChat] Fetching history for AI context...");
            const chat = await Chat.findById(chatId);
            const history = (chat.history || [])
                .map(item => ({
                    role: item.role === "bot" ? "model" : (item.role || "user"),
                    parts: (item.parts || [])
                        .map(p => ({ text: decrypt(p.text) }))
                        .filter(p => p.text && p.text.trim().length > 0)
                }))
                .filter(item => item.parts.length > 0);

            log(`[updateChat] Sending ${history.length} history items to Gemini.`);

            log("[updateChat] Generating AI response...");
            const chatModel = model.startChat({ history: history.slice(0, -1) }); // exclude the last part we just added manually
            const result = await chatModel.sendMessage(question);
            aiResponse = result.response.text();
            log("[updateChat] AI response generated.");

            // Add bot response to history
            await Chat.updateOne(
                { _id: chatId },
                {
                    $push: {
                        history: {
                            role: "model",
                            parts: [{ text: encrypt(aiResponse) }]
                        }
                    }
                }
            );
        } catch (error) {
            log("[updateChat] AI Generation error: " + error.message);
        }

        log("[updateChat] Success. Sending response.");
        res.status(200).json({
            message: "Chat updated",
            aiResponse,
            riskAlert: sentimentScore > 0.7,
            alertMessage: sentimentScore > 0.7
                ? "It's okay to feel this way. We've detected some high-stress signals in your messages. Please take a moment for yourself or talk to someone you trust."
                : null
        });

    } catch (error) {
        console.error("[updateChat] FATAL ERROR:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

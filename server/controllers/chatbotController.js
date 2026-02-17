// j:\sayalee\innovateyou\SoulSync\server\controllers\chatbotController.js
import ImageKit from "imagekit";
import UserChat from "../models/Botuserchat.js";
import Chat from "../models/Botchat.js";
import { setCache, getCache, deleteCachePattern, invalidateChatCache, cacheKeys } from "../utils/cacheUtils.js";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// GET /api/upload
export const getUploadAuth = (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
};

// POST /api/chats
export const createChat = async (req, res) => {
    const userId = req.userId;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Text is required" });

    try {
        const newChat = new Chat({
            userId,
            history: [
                {
                    role: "user",
                    parts: [{ text }],
                    img: req.body.img || null
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

        // Invalidate chat list cache
        await invalidateChatCache(userId);

        res.status(201).json({ chatId: newChat._id });

    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/userchats
export const getUserChats = async (req, res) => {
    const userId = req.userId;

    try {
        // Check cache first
        const cacheKey = cacheKeys.chatList(userId);
        const cachedChats = await getCache(cacheKey);
        if(cachedChats) {
            return res.status(200).json(cachedChats);
        }

        const userChat = await UserChat.findOne({ userId });

        const response = { chats: userChat ? userChat.chats : [] };

        // Cache for 30 minutes
        await setCache(cacheKey, response, 1800);

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/chats/:id
export const getChatById = async (req, res) => {
    try {
        // Check cache first
        const cacheKey = cacheKeys.chat(req.params.id);
        const cachedChat = await getCache(cacheKey);
        if(cachedChat) {
            return res.status(200).json(cachedChat);
        }

        const chat = await Chat.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Cache for 1 hour
        await setCache(cacheKey, chat, 3600);

        res.status(200).json(chat);

    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/chats/:id
export const updateChat = async (req, res) => {
    try {
        const { question, answer } = req.body;

        await Chat.updateOne(
            { _id: req.params.id, userId: req.userId },
            {
                $push: {
                    history: [
                        {
                            role: "user",
                            parts: [{ text: question }],
                            img: req.body.img || null
                        },
                        {
                            role: "model",
                            parts: [{ text: answer }]
                        }
                    ]
                }
            }
        );

        // Invalidate chat and chat list caches
        const cacheKey = cacheKeys.chat(req.params.id);
        await deleteCachePattern(cacheKey);
        await invalidateChatCache(req.userId);

        res.status(200).json({ message: "Chat updated" });

    } catch (error) {
        console.error("Error updating chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
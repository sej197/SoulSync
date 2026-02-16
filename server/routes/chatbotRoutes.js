import express from "express";
import userAuth from "../middleware/authmiddleware.js";
import {
    getUploadAuth,
    createChat,
    getUserChats,
    getChatById,
    updateChat
} from "../controllers/chatbotController.js";

const router = express.Router();

router.get("/upload", userAuth, getUploadAuth);
router.post("/chats", userAuth, createChat);
router.get("/userchats", userAuth, getUserChats);
router.get("/chats/:id", userAuth, getChatById);
router.put("/chats/:id", userAuth, updateChat);

export default router;
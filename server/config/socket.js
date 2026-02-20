import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ChatMessage from "../models/ChatMessage.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
import axios from "axios";

let ioInstance = null;

export function getIO() {
    if (!ioInstance) throw new Error("Socket.IO not initialized");
    return ioInstance;
}

const HATE_SPEECH_THRESHOLD = 0.6;

const checkHateSpeech = async (text) => {
    try {
        const response = await axios.post(
            `${process.env.PYTHON_SERVER}/hatespeech/analyze`,
            { text }
        );
        return response.data.paragraphScore ?? 0;
    } catch (error) {
        console.error("Chat hate speech API error:", error.message);
        return 0;
    }
};

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    ioInstance = io;

    // Authenticate socket connections via JWT cookie
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) return next(new Error("No cookies"));

            const tokenMatch = cookieHeader.match(/token=([^;]+)/);
            if (!tokenMatch) return next(new Error("No token cookie"));

            const decoded = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
            if (!decoded.id) return next(new Error("Invalid token"));

            socket.userId = decoded.id;
            next();
        } catch (err) {
            console.error("Socket auth error:", err.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[SOCKET] User ${socket.userId} connected`);

        // Join community posts room (for live post/comment updates)
        socket.on("join-community", (communityId) => {
            socket.join(`posts:${communityId}`);
            console.log(`[SOCKET] User ${socket.userId} joined posts room for ${communityId}`);
        });

        socket.on("leave-community", (communityId) => {
            socket.leave(`posts:${communityId}`);
            console.log(`[SOCKET] User ${socket.userId} left posts room for ${communityId}`);
        });

        // Join a community chat room
        socket.on("join-room", async (communityId) => {
            try {
                const community = await Community.findById(communityId);
                if (!community) return socket.emit("error", { message: "Community not found" });

                const isMember = community.members.some(
                    (m) => m.toString() === socket.userId
                );
                if (!isMember) return socket.emit("error", { message: "Not a member of this community" });

                socket.join(communityId);
                socket.currentRoom = communityId;

                // Get online count for this room
                const roomSockets = await io.in(communityId).fetchSockets();
                const uniqueUsers = new Set(roomSockets.map((s) => s.userId));
                io.to(communityId).emit("online-count", uniqueUsers.size);

                console.log(`[SOCKET] User ${socket.userId} joined room ${communityId}`);
            } catch (err) {
                console.error("Join room error:", err.message);
                socket.emit("error", { message: "Failed to join room" });
            }
        });

        // Leave room
        socket.on("leave-room", async (communityId) => {
            socket.leave(communityId);
            socket.currentRoom = null;

            const roomSockets = await io.in(communityId).fetchSockets();
            const uniqueUsers = new Set(roomSockets.map((s) => s.userId));
            io.to(communityId).emit("online-count", uniqueUsers.size);

            console.log(`[SOCKET] User ${socket.userId} left room ${communityId}`);
        });

        // Send message
        socket.on("send-message", async ({ communityId, text }) => {
            try {
                if (!text || !text.trim()) return;
                text = text.trim();

                // Check if user is banned
                const sender = await User.findById(socket.userId).select("username is_banned");
                if (!sender) return socket.emit("error", { message: "User not found" });
                if (sender.is_banned) {
                    return socket.emit("error", { message: "Your account is suspended. You cannot send messages." });
                }

                // Check hate speech
                const hateSpeechScore = await checkHateSpeech(text);
                const isFlagged = hateSpeechScore >= HATE_SPEECH_THRESHOLD;

                // Save to DB
                const message = await ChatMessage.create({
                    community: communityId,
                    sender: socket.userId,
                    text,
                    hate_speech_flag: isFlagged
                });

                // Populate sender info
                const populated = await ChatMessage.findById(message._id)
                    .populate("sender", "username");

                const msgData = {
                    _id: populated._id,
                    text: populated.text,
                    sender: populated.sender,
                    hate_speech_flag: populated.hate_speech_flag,
                    createdAt: populated.createdAt
                };

                // Broadcast to room
                io.to(communityId).emit("new-message", msgData);

                // If flagged, warn the sender privately
                if (isFlagged) {
                    // Increment warnings
                    const user = await User.findById(socket.userId);
                    if (user) {
                        user.hate_speech_warnings += 1;
                        user.hate_speech_logs.push({
                            postId: message._id,
                            score: hateSpeechScore,
                            text_snippet: text.length > 100 ? text.substring(0, 100) + "..." : text,
                            date: new Date()
                        });
                        if (user.hate_speech_warnings >= 3) {
                            user.is_banned = true;
                        }
                        await user.save();
                    }

                    socket.emit("message-flagged", {
                        messageId: message._id,
                        warnings: user?.hate_speech_warnings || 0,
                        banned: user?.is_banned || false,
                        message: "Your message was flagged for violating community guidelines."
                    });
                }
            } catch (err) {
                console.error("Send message error:", err.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Typing indicators
        socket.on("typing", (communityId) => {
            socket.to(communityId).emit("user-typing", { userId: socket.userId });
        });

        socket.on("stop-typing", (communityId) => {
            socket.to(communityId).emit("user-stop-typing", { userId: socket.userId });
        });

        // Disconnect
        socket.on("disconnect", async () => {
            console.log(`[SOCKET] User ${socket.userId} disconnected`);
            if (socket.currentRoom) {
                const roomSockets = await io.in(socket.currentRoom).fetchSockets();
                const uniqueUsers = new Set(roomSockets.map((s) => s.userId));
                io.to(socket.currentRoom).emit("online-count", uniqueUsers.size);
            }
        });
    });

    return io;
}

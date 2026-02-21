import ChatMessage from "../models/ChatMessage.js";
import Community from "../models/Community.js";
import { getIO } from "../config/socket.js";


export const getMessages = async (req, res) => {
    try {
        const { communityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({
                message: "Community not found" 
            });
        }

       
        const isMember = community.members.some(
            (m) => m.toString() === req.userId
        );
        if (!isMember) {
            return res.status(403).json({
                message: "Not a member of this community" 
            });
        }

        const totalMessages = await ChatMessage.countDocuments({
            community: communityId 
        });

       
        const messages = await ChatMessage.find({
                            community: communityId 
                        })
                        .populate("sender", "username")
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);

        res.json({
            messages: messages.reverse(),
            totalMessages,
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            hasMore: skip + messages.length < totalMessages
        });
    } catch (err) {
        console.error("Error fetching chat messages:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await ChatMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({
                message: "Message not found" 
            });
        }

        if (message.sender.toString() !== req.userId) {
            return res.status(403).json({
                message: "Not authorized to delete this message" 
            });
        }

        const communityId = message.community.toString();
        await message.deleteOne();

        // Broadcast deletion to the chat room in real-time
        try {
            getIO().to(communityId).emit("delete-message", { messageId });
        } catch (e) { console.error("Socket emit error:", e.message); }

        res.json({
            message: "Message deleted successfully"
         });
    } catch (err) {
        console.error("Error deleting chat message:", err.message);
        res.status(500).json({
            message: "Internal Server Error" 
        });
    }
};

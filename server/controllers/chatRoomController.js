import ChatMessage from "../models/ChatMessage.js";
import Community from "../models/Community.js";

// GET /api/chat/:communityId/messages?page=1&limit=50
export const getMessages = async (req, res) => {
    try {
        const { communityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        // Verify membership
        const isMember = community.members.some(
            (m) => m.toString() === req.userId
        );
        if (!isMember) {
            return res.status(403).json({ message: "Not a member of this community" });
        }

        const totalMessages = await ChatMessage.countDocuments({ community: communityId });

        // Get messages in reverse-chronological order, then reverse for display
        const messages = await ChatMessage.find({ community: communityId })
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

// DELETE /api/chat/:communityId/messages/:messageId
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await ChatMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await message.deleteOne();

        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting chat message:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

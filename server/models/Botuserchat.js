import mongoose from "mongoose";

const botUserChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    chats: [
        {
            _id: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now(),
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

export default mongoose.models.UserChat || mongoose.model("UserChat", botUserChatSchema);

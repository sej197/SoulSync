import mongoose from "mongoose";

const botChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    history: [
        {
            role: {
                type: String,
                enum: ["user", "model", "bot"],
                required: true
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    }
                }
            ],
            img: {
                type: String,
                required: false
            }
        }
    ]
}, {
    timestamps: true
});

export default mongoose.models.chat || mongoose.model("Chat", botChatSchema);

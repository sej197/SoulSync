import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { fetchChatById, createChat, updateChat } from "../../lib/chatbotapi";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import "./newprompt.css";
import { useNavigate } from "react-router-dom";
export default function Newprompt({ chatId }) {
    const navigate = useNavigate();
    const activeChatId = chatId;

    const [ques, setQues] = useState("");
    const [ans, setAns] = useState("");
    const [chat, setChat] = useState([]);
    const endRef = useRef(null);

    useEffect(() => {
        console.log("[Newprompt] Component mounted. ChatId:", activeChatId);
    }, []);

    // Auto scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);


    useEffect(() => {
        const fetchChat = async () => {
            if (!activeChatId || activeChatId === "new") {
                setChat([]);
                return;
            };

            try {
                const data = await fetchChatById(activeChatId);

                const formatted = (data.history || []).map((item) => ({
                    type: item.role === "user" ? "user" : "bot",
                    text: item.parts && item.parts.length > 0 ? item.parts[0].text : ""
                }));

                setChat(formatted);

            } catch (err) {
                console.error("Error loading chat:", err);
                toast.error("Failed to load chat history.");
            }
        };

        fetchChat();
    }, [activeChatId]);

    const add = async (text) => {
        if (!text) return;
        console.log("[Newprompt] Sending message (backend AI mode):", text);
        setQues("");

        let currentChatId = activeChatId;

        try {
            // Add user message locally for immediate UI update
            setChat(prev => [...prev, { type: "user", text }]);

            if (!currentChatId || currentChatId === "new") {
                const data = await createChat(text);
                currentChatId = data.chatId;

                // Add bot response returned from server
                if (data.aiResponse) {
                    setChat(prev => [...prev, { type: "bot", text: data.aiResponse }]);
                }

                // Redirect to real chat page
                navigate(`/chatbot/${currentChatId}`);

                if (data && data.riskAlert) {
                    toast.error(data.alertMessage, {
                        duration: 6000,
                        position: "top-center",
                    });
                }
                return;
            }

            // For existing chats
            const data = await updateChat(currentChatId, text, "processing..."); // answer is ignored by backend now for actual gen but kept for API compatibility

            if (data.aiResponse) {
                setChat(prev => [...prev, { type: "bot", text: data.aiResponse }]);
            }

            if (data && data.riskAlert) {
                toast.error(data.alertMessage, {
                    duration: 6000,
                    position: "top-center",
                });
            }

        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to send message.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = ques || e.target.text.value;
        console.log("[Newprompt] handleSubmit triggered. Text:", text, "ChatId:", activeChatId);
        alert("[Newprompt] Submitting: " + text);
        if (!text) return;
        add(text);
    };

    return (
        <div className="newprompt-container">
            <div className="chat-messages">
                {chat.map((m, idx) => (
                    <div key={idx} className={`message-row ${m.type}`}>
                        {m.type === "user" && (
                            <div className="message-user">
                                {m.text}
                            </div>
                        )}

                        {m.type === "bot" && (
                            <div className="message-bot">
                                <Markdown>{m.text}</Markdown>
                            </div>
                        )}
                    </div>
                ))}

                <div ref={endRef}></div>
            </div>

            <form className="new-form" onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="text"
                    value={ques}
                    onChange={(e) => setQues(e.target.value)}
                    placeholder="Ask me anything!"
                />

                <button type="submit" className="sendButton">
                    <ArrowUp size={25} />
                </button>
            </form>
        </div>
    );
}
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import model from "../../lib/gemini";
import { fetchChatById, createChat, updateChat } from "../../lib/chatbotapi";
import Markdown from "react-markdown";
import "./newprompt.css";

export default function Newprompt({ chatId }) {
    const navigate = useNavigate();
    const activeChatId = chatId;

    const [ques, setQues] = useState("");
    const [ans, setAns] = useState("");
    const [chat, setChat] = useState([]);
    const endRef = useRef(null);

    const chatModel = model.startChat({
        history: [],
        generationConfig: {}
    });

    // Auto scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);


    useEffect(() => {
        const fetchChat = async () => {
            if (!activeChatId) return;

            try {
                const data = await fetchChatById(activeChatId);

                const formatted = data.history.map((item) => ({
                    type: item.role === "user" ? "user" : "bot",
                    text: item.parts[0].text
                }));

                setChat(formatted);

                //  Fix: If the last message is from user (no bot response yet), trigger AI
                if (formatted.length > 0 && formatted[formatted.length - 1].type === "user") {
                    const lastMsg = formatted[formatted.length - 1].text;
                    // Trigger the 'add' logic manually or via a side effect
                    // To avoid infinite loops, we can track if we've already responded to this ID
                    addAIResponse(lastMsg, activeChatId);
                }

            } catch (err) {
                console.error("Error loading chat:", err);
            }
        };

        fetchChat();
    }, [activeChatId]);

    // Split 'add' into user part and AI part to reuse the AI part
    const addAIResponse = async (text, currentChatId) => {
        try {
            const payload = text;

            const result = await chatModel.sendMessageStream(payload);

            let response = "";
            for await (const chunk of result.stream) {
                const textChunk = chunk.text();
                response += textChunk;
                setAns(response);
            }

            // Add bot message locally
            setChat(prev => [
                ...prev,
                { type: "bot", text: response }
            ]);
            setAns("");


            await updateChat(
                currentChatId,
                text,
                response
            );
        } catch (error) {
            console.error("AI response error:", error);
        }
    };


    const add = async (text) => {
        if (!text) return;

        setQues("");

        let currentChatId = activeChatId;

        try {

            if (!currentChatId) {
                const data = await createChat(text);
                currentChatId = data.chatId;

                // Update UI immediately for a snappy feel
                setChat([{ type: "user", text }]);

                // Redirect to real chat page
                navigate(`/chatbot/${currentChatId}`);

                // Continue to AI response
                await addAIResponse(text, currentChatId);
                return;
            }


            setChat(prev => [
                ...prev,
                { type: "user", text }
            ]);

            await addAIResponse(text, currentChatId);

        } catch (error) {
            console.error("Chat error:", error);
        }

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
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
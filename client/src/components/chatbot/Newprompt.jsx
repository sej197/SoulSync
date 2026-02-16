import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IKImage } from "imagekitio-react";
import { useNavigate } from "react-router-dom";
import Uploads from "./Uploads";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import "./newprompt.css";

export default function Newprompt({ chatId }) {
    const navigate = useNavigate();
    const activeChatId = chatId;

    const [ques, setQues] = useState("");
    const [ans, setAns] = useState("");
    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {}
    });
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

    // 🔥 Load existing chat
    useEffect(() => {
        const fetchChat = async () => {
            if (!activeChatId) return;

            try {
                const res = await fetch(
                    `http://localhost:5000/api/chats/${activeChatId}`,
                    { credentials: "include" }
                );

                if (!res.ok) return;

                const data = await res.json();

                const formatted = data.history.map((item) => ({
                    type: item.role === "user" ? "user" : "bot",
                    text: item.parts[0].text,
                    img: item.img ? { filePath: item.img } : null
                }));

                setChat(formatted);

                // ✨ Fix: If the last message is from user (no bot response yet), trigger AI
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
            const payload =
                Object.keys(img.aiData).length > 0
                    ? [img.aiData, { text }]
                    : text;

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

            // 🟢 Save to DB
            await fetch(
                `http://localhost:5000/api/chats/${currentChatId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        question: text,
                        answer: response,
                        img: img.dbData?.filePath || null
                    })
                }
            );
        } catch (error) {
            console.error("AI response error:", error);
        }
    };

    // 🔥 Main Send Logic
    const add = async (text) => {
        if (!text) return;

        setQues("");

        let currentChatId = activeChatId;

        try {
            // 🟢 If NEW CHAT → create first
            if (!currentChatId) {
                const res = await fetch(
                    "http://localhost:5000/api/chats",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({ text, img: img.dbData?.filePath || null })
                    }
                );

                const data = await res.json();
                currentChatId = data.chatId;

                // Update UI immediately for a snappy feel
                setChat([{ type: "user", text, img: img.dbData }]);

                // Redirect to real chat page
                navigate(`/chatbot/${currentChatId}`);

                // Continue to AI response
                await addAIResponse(text, currentChatId);
                return;
            }

            // 🟢 Add user message locally
            setChat(prev => [
                ...prev,
                { type: "user", text, img: img.dbData }
            ]);

            await addAIResponse(text, currentChatId);

        } catch (error) {
            console.error("Chat error:", error);
        }

        // Reset image
        setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {}
        });
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
                            <div className={`message-user ${m.img?.filePath ? "no-bg" : ""}`}>
                                {m.text}
                            </div>
                        )}

                        {m.img?.filePath && (
                            <div className="image-wrapper">
                                {m.img.filePath.startsWith("data:") ? (
                                    <img src={m.img.filePath} className="message-img" alt="preview" />
                                ) : (
                                    <IKImage
                                        urlEndpoint={import.meta.env.VITE_IMAGEKIT_ENDPOINT}
                                        path={m.img.filePath}
                                        width={120}
                                        height={120}
                                        className="message-img"
                                    />
                                )}
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
                <Uploads setImg={setImg} setChat={setChat} />

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
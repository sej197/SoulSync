import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Uploads from "./Uploads";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import "./newprompt.css";

export default function Newprompt() {
    const [ques, setQues] = useState("");
    const [ans, setAns] = useState("");
    const [img, setImg] = useState({ isLoading: false, error: "", dbData: {}, aiData: {} });
    const [chat, setChat] = useState([]);
    const endRef = useRef(null);

    const chatModel = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Hello, how are you?" }],
            },
            {
                role: "model",
                parts: [{ text: "I'm doing well, thank you!" }],
            },
        ],
        generationConfig: {

        }
    });

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const add = async (text) => {
        setQues(text);

        setChat(prev => [...prev, { type: "user", text, img: img.dbData }]);

        const payload = Object.keys(img.aiData).length > 0 ? [img.aiData, { text }] : text;
        const result = await chatModel.sendMessageStream(payload);

        let response = "";
        for await (const chunk of result.stream) {
            const textChunk = chunk.text();
            response += textChunk;
            setAns(response);
        }

        setChat(prev => [...prev, { type: "bot", text: response }]);

        setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
        setQues("");
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
                                <IKImage
                                    urlEndpoint={import.meta.env.VITE_IMAGEKIT_ENDPOINT}
                                    path={m.img.filePath}
                                    width={120}
                                    height={120}
                                    className="message-img"
                                />
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
                <label className="file-label">
                    <Uploads setImg={setImg} />
                </label>
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
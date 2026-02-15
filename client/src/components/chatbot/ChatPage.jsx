import { useParams } from "react-router-dom";
import "./chatpage.css";
import Newprompt from "./Newprompt";

export default function ChatPage() {
    const { id } = useParams();

    return (
        <div className="chatpage-container">
            <div className="chat-wrapper">
                <Newprompt chatId={id} />
            </div>
        </div>
    );
}
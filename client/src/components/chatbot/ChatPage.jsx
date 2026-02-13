import "./chatpage.css";
import Newprompt from "./Newprompt";

export default function ChatPage() {
    return (
        <div className="chatpage-container">
            <div className="chat-wrapper">
                <Newprompt />
            </div>
        </div>
    );
}
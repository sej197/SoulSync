import { Link } from "react-router-dom";
import "./chatbotlist.css"

export default function ChatbotList({ chats }) {
    return (
        <div className="chatList">
            <span className="title">DASHBOARD</span>
            <Link to="/chatbot/new">Start a new chat</Link>
            <hr />
            <span className="title">RECENT CHATS</span>
            <div className="list">
                {chats.length === 0 && <p>No chats yet</p>}
                {chats.map((chat) => (
                    <Link key={chat._id} to={`/chatbot/${chat._id}`}>
                        {chat.title}
                    </Link>
                ))}
            </div>
            <hr />
        </div>
    );
}
import { Link } from "react-router-dom";
import "./chatbotlist.css"

export default function ChatbotList() {
    return (
        <div className="chatList">
            <span className="title">DASHBOARD</span>
            <Link to="/chatbot/new">Start a new chat</Link>
            <hr />
            <span className="title">RECENT CHATS</span>
            <div className="list">
                <Link to="/chatbot/1">chat 1</Link>
                {/*<Link to="/chatbot/2">Chat 2</Link>
                <Link to="/chatbot/3">Chat 3</Link>
                <Link to="/chatbot/4">Chat 4</Link>
                <Link to="/chatbot/5">Chat 5</Link>
                <Link to="/chatbot/6">Chat 6</Link>
                <Link to="/chatbot/7">Chat 7</Link>
                <Link to="/chatbot/8">Chat 8</Link>
                <Link to="/chatbot/9">Chat 9</Link>
                <Link to="/chatbot/10">Chat 10</Link>*/}
            </div>
            <hr />
        </div>
    );
}
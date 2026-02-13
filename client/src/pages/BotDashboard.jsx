import { Outlet, useLocation } from 'react-router-dom';
import { MessageSquarePlus, History, Heart, ArrowRight } from 'lucide-react';
import './dashboard.css';
import ChatbotList from '../components/chatbot/ChatbotList';

export default function BotDashboard() {
    const location = useLocation();
    const isMainDashboard = location.pathname === "/chatbot";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;

        const response = await fetch("http://localhost:5000/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        console.log("New chat created:", data.chatId);
        e.target.reset();
    };

    return (
        <div className='dashboard-layout'>
            <div className="menus">
                <ChatbotList />
            </div>

            <div className="content">
                {isMainDashboard && (
                    <div className="texts">
                        <span className="title">SYNC AI - your personal chatbot</span>
                        <div className="cards">
                            <div className="options">
                                <MessageSquarePlus className="icon" />
                                <span>Create a new chat</span>
                            </div>
                            <div className="options">
                                <History className="icon" />
                                <span>Scroll through previous memoirs</span>
                            </div>
                            <div className="options">
                                <Heart className="icon" />
                                <span>Put your heart out</span>
                            </div>
                        </div>
                        <div className="formContainer">
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="text"
                                    placeholder="Ask me anything!"
                                />
                                <button className="sendButton">
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                <Outlet />
            </div>
        </div>
    );
}

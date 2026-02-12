import { Outlet, useLocation } from 'react-router-dom';
import { MessageSquarePlus, History, Heart, ArrowRight } from 'lucide-react';
import './dashboard.css';
import ChatbotList from '../components/chatbot/ChatbotList';

export default function BotDashboard() {
    const location = useLocation();
    const isMainDashboard = location.pathname === "/chatbot";

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
                            <input type="text" placeholder="Ask me anything!" />
                            <button className="sendButton">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
                <Outlet />
                {!isMainDashboard && <div>Chat Page Loading...</div>}

            </div>
        </div>
    );
}

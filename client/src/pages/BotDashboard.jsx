import { Outlet } from 'react-router-dom';
import { MessageSquarePlus, History, Heart, ArrowRight } from 'lucide-react';
import './dashboard.css';
import ChatbotList from '../components/ChatbotList';

export default function BotDashboard() {
    return (
        <>
            <div className='dashboard-layout'>
                <div className="menus">
                    <ChatbotList />
                </div>
                <div className="content">
                    <div className="texts">
                        <span className="title">AI CHATBOT</span>
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
                    <Outlet />
                </div>
            </div>
        </>
    );
}

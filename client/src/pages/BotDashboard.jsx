import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { MessageSquarePlus, History, Heart, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './dashboard.css';
import ChatbotList from '../components/chatbot/ChatbotList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserChats, createChat } from '../lib/chatbotapi';

export default function BotDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isMainDashboard = location.pathname === "/chatbot";

    const queryClient = useQueryClient();

    const { data: chatsData, isLoading, error } = useQuery({
        queryKey: ['userChats'],
        queryFn: fetchUserChats
    });

    const createChatMutation = useMutation({
        mutationFn: (text) => createChat(text),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            if (data.chatId) {
                navigate(`/chatbot/${data.chatId}`);
            }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        if (!text) return;

        createChatMutation.mutate(text);
        e.target.reset();
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Mobile Toggle Button */}
            <button className="mobile-toggle" onClick={toggleSidebar}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`menus ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <span className="logo">SoulSync AI</span>
                    <button className="mobile-close" onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                </div>
                <ChatbotList chats={chatsData?.chats || []} />
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <div className="content">
                {isMainDashboard && (
                    <div className="texts">
                        <div className="title-container">
                            <h1 className="title">SyncAI</h1>
                            <p className="subtitle">Your supportive workspace for mental clarity</p>
                        </div>

                        <div className="cards">
                            <div className="options">
                                <div className="icon-wrapper purple">
                                    <MessageSquarePlus className="icon" />
                                </div>
                                <span>Create a new chat</span>
                            </div>
                            <div className="options">
                                <div className="icon-wrapper orange">
                                    <History className="icon" />
                                </div>
                                <span>Previous memoirs</span>
                            </div>
                            <div className="options">
                                <div className="icon-wrapper teal">
                                    <Heart className="icon" />
                                </div>
                                <span>Heart out</span>
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

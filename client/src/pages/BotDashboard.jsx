import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { MessageSquarePlus, History, Heart, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import './dashboard.css';
import ChatbotList from '../components/chatbot/ChatbotList';
import EmotionDetector from '../components/EmotionDetector';
import MoodMismatchBanner from '../components/MoodMismatchBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserChats, createChat } from '../lib/chatbotapi';

export default function BotDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [ques, setQues] = useState("");
    const [mismatchMessage, setMismatchMessage] = useState(null);
    const location = useLocation();
    const faceEmotionRef = useRef('neutral');
    const isMainDashboard = location.pathname === "/chatbot";

    const queryClient = useQueryClient();

    const { data: chatsData, isLoading, error } = useQuery({
        queryKey: ['userChats'],
        queryFn: fetchUserChats
    });

    const createChatMutation = useMutation({
        mutationFn: (text) => createChat(text),
        onSuccess: (data) => {
            console.log("[BotDashboard] Mutation success. Data:", data);
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            if (data.chatId) {
                navigate(`/chatbot/${data.chatId}`);
            }
            if (data.riskAlert) {
                toast.error(data.alertMessage, {
                    duration: 6000,
                    position: "top-center",
                });
            }
        },
        onError: (err) => {
            console.error("[BotDashboard] Mutation error:", err);
            toast.error("Failed to start chat.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = ques || e.target.text.value;
        console.log("[BotDashboard] handleSubmit triggered. Text:", text);
        if (!text) return;

        createChatMutation.mutate(text);
        setQues("");
        e.target.reset();
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const inputRef = useRef(null);
    const focusInput = () => inputRef.current?.focus();

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <MoodMismatchBanner message={mismatchMessage} onDismiss={() => setMismatchMessage(null)} />
            <EmotionDetector onEmotionDetected={(e) => {
                console.log("[BotDashboard] Emotion signal:", e);
                faceEmotionRef.current = e;
            }} />
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
                            <div className="options" onClick={focusInput}>
                                <div className="icon-wrapper purple">
                                    <MessageSquarePlus className="icon" />
                                </div>
                                <span>Create a new chat</span>
                            </div>
                            <div className="options" onClick={() => setIsSidebarOpen(true)}>
                                <div className="icon-wrapper orange">
                                    <History className="icon" />
                                </div>
                                <span>Previous memoirs</span>
                            </div>
                            <div className="options" onClick={focusInput}>
                                <div className="icon-wrapper teal">
                                    <Heart className="icon" />
                                </div>
                                <span>Heart out</span>
                            </div>
                        </div>

                        <div className="formContainer">
                            <form onSubmit={handleSubmit}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    name="text"
                                    value={ques}
                                    onChange={(e) => setQues(e.target.value)}
                                    placeholder="Ask me anything!"
                                />
                                <button type="submit" className="sendButton">
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                <Outlet context={{ faceEmotionRef, setMismatchMessage }} />
            </div>
        </div>
    );
}

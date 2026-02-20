import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
    Send, Loader2, X, AlertTriangle, ShieldAlert, Users, Trash2, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { fetchChatMessages, deleteChatMessage } from '../../lib/chatRoomApi';
import {
    connectSocket, disconnectSocket, joinRoom, leaveRoom,
    sendMessage as socketSendMessage, getSocket, emitTyping, emitStopTyping
} from '../../lib/socket';

export default function GroupChat({ communityId, communityName, userBanned }) {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isAtBottomRef = useRef(true);

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'instant'
        });
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
        isAtBottomRef.current = atBottom;
        setShowScrollBtn(!atBottom);
    };

    // Load initial messages
    const loadMessages = useCallback(async (pg = 1) => {
        try {
            if (pg === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await fetchChatMessages(communityId, pg);
            const { messages: msgs, hasMore: more } = res.data;

            if (pg === 1) {
                setMessages(msgs);
            } else {
                setMessages(prev => [...msgs, ...prev]);
            }
            setHasMore(more);
            setPage(pg);
        } catch (err) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [communityId]);

    // Setup socket connection
    useEffect(() => {
        const socket = connectSocket();

        socket.on('connect', () => {
            joinRoom(communityId);
        });

        // If already connected, join immediately
        if (socket.connected) {
            joinRoom(communityId);
        }

        socket.on('new-message', (msg) => {
            setMessages(prev => [...prev, msg]);
            // Auto-scroll if user is at bottom
            if (isAtBottomRef.current) {
                setTimeout(() => scrollToBottom(), 50);
            }
        });

        socket.on('online-count', (count) => {
            setOnlineCount(count);
        });

        socket.on('message-flagged', (data) => {
            toast.error(data.message, { duration: 6000, icon: '⚠️' });
        });

        socket.on('error', (data) => {
            toast.error(data.message);
        });

        // Load initial messages
        loadMessages(1);

        return () => {
            leaveRoom(communityId);
            socket.off('new-message');
            socket.off('online-count');
            socket.off('message-flagged');
            socket.off('error');
            socket.off('connect');
        };
    }, [communityId, loadMessages]);

    // Scroll to bottom on first load
    useEffect(() => {
        if (!loading && messages.length > 0) {
            scrollToBottom(false);
        }
    }, [loading]);

    const handleSend = () => {
        const text = inputText.trim();
        if (!text || userBanned) return;

        socketSendMessage(communityId, text);
        setInputText('');
        emitStopTyping(communityId);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);

        // Typing indicator
        emitTyping(communityId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(communityId);
        }, 2000);
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteChatMessage(communityId, messageId);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast.success('Message deleted');
        } catch (err) {
            toast.error('Failed to delete message');
        }
    };

    const handleLoadMore = async () => {
        const container = messagesContainerRef.current;
        const prevScrollHeight = container?.scrollHeight || 0;

        await loadMessages(page + 1);

        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
            if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
        });
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-[2rem] shadow-lg border border-white/60 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-serif font-bold text-[#3E2723]">
                        Group Chat
                    </h2>
                    <p className="text-xs text-[#8D6E63]">{communityName}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
                    <span className="text-xs font-bold">{onlineCount} online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#FAFAFA]"
            >
                {/* Load more button */}
                {hasMore && (
                    <div className="text-center pb-2">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-4 py-1.5 rounded-xl bg-white/70 text-[#7B1FA2] text-xs font-bold border border-[#CE93D8] hover:bg-white transition-all disabled:opacity-50"
                        >
                            {loadingMore ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                            Load older messages
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-[#7B1FA2]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users size={40} className="text-[#CE93D8] mb-3" />
                        <p className="text-[#8D6E63] font-medium">No messages yet</p>
                        <p className="text-xs text-[#BCAAA4] mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender?._id === user?.id || msg.sender === user?.id;

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {/* Flagged badge */}
                                    {msg.hate_speech_flag && (
                                        <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <AlertTriangle size={10} className="text-red-500" />
                                            <span className="text-[9px] font-bold text-red-500 uppercase">Flagged</span>
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-2xl px-4 py-2.5 ${
                                            msg.hate_speech_flag
                                                ? 'border-2 border-red-300 ' + (isOwn ? 'bg-red-50' : 'bg-red-50')
                                                : isOwn
                                                    ? 'bg-[#7B1FA2] text-white'
                                                    : 'bg-white border border-gray-100'
                                        }`}
                                    >
                                        {!isOwn && (
                                            <p className={`text-xs font-bold mb-0.5 ${msg.hate_speech_flag ? 'text-red-700' : 'text-[#8E24AA]'}`}>
                                                {msg.sender?.username || 'User'}
                                            </p>
                                        )}
                                        <p className={`text-sm leading-relaxed break-words ${
                                            msg.hate_speech_flag
                                                ? 'text-red-800'
                                                : isOwn
                                                    ? 'text-white'
                                                    : 'text-[#3E2723]'
                                        }`}>
                                            {msg.text}
                                        </p>
                                        <p className={`text-[10px] mt-1 ${
                                            msg.hate_speech_flag
                                                ? 'text-red-400'
                                                : isOwn
                                                    ? 'text-white/60'
                                                    : 'text-[#BCAAA4]'
                                        }`}>
                                            {timeAgo(msg.createdAt)}
                                        </p>
                                    </div>
                                    {/* Delete button for own messages */}
                                    {isOwn && (
                                        <div className="flex justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="text-[10px] text-[#8D6E63] hover:text-red-600 font-medium flex items-center gap-0.5"
                                            >
                                                <Trash2 size={10} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBtn && (
                <div className="absolute bottom-24 right-8">
                    <button
                        onClick={() => scrollToBottom()}
                        className="w-10 h-10 rounded-full bg-[#7B1FA2] text-white shadow-lg flex items-center justify-center hover:bg-[#6A1B9A] transition-all"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
                {userBanned ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-400 text-sm font-medium">
                        <ShieldAlert size={16} />
                        Chat is disabled for suspended accounts
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] placeholder-[#8D6E63] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || sending}
                            className="px-5 py-3 rounded-xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

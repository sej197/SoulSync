import axios from 'axios';

const chatbotapi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api/chatbot`,
    withCredentials: true
});

export const fetchUserChats = async () => {
    const res = await chatbotapi.get('/userchats');
    return res.data;
};

export const fetchChatById = async (chatId) => {
    const res = await chatbotapi.get(`/chats/${chatId}`);
    return res.data;
};

export const createChat = async (text) => {
    const res = await chatbotapi.post('/chats', { text });
    return res.data;
};

export const updateChat = async (chatId, question, answer) => {
    const res = await chatbotapi.put(`/chats/${chatId}`, { question, answer });
    return res.data;
};


export default chatbotapi;

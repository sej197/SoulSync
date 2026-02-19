import axios from 'axios';

const chatbotapi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api/chatbot`,
    withCredentials: true
});

export const fetchUserChats = async () => {
    console.log("[chatbotapi] fetchUserChats called");
    const res = await chatbotapi.get('/userchats');
    return res.data;
};

export const fetchChatById = async (chatId) => {
    console.log("[chatbotapi] fetchChatById called:", chatId);
    const res = await chatbotapi.get(`/chats/${chatId}`);
    return res.data;
};

export const createChat = async (text) => {
    console.log("[chatbotapi] createChat called. Text:", text.substring(0, 20));
    const res = await chatbotapi.post('/chats', { text });
    return res.data;
};

export const updateChat = async (chatId, question, answer) => {
    console.log("[chatbotapi] updateChat called. Id:", chatId);
    const res = await chatbotapi.put(`/chats/${chatId}`, { question, answer });
    return res.data;
};


export default chatbotapi;

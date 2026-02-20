import axios from 'axios';

const API = axios.create({
    baseURL: '/api/chat',
    withCredentials: true,
});

export const fetchChatMessages = (communityId, page = 1, limit = 50) => {
    return API.get(`/${communityId}/messages`, { params: { page, limit } });
};

export const deleteChatMessage = (communityId, messageId) => {
    return API.delete(`/${communityId}/messages/${messageId}`);
};

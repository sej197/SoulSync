import axios from 'axios';

const API = axios.create({
    baseURL: '/api/posts',
    withCredentials: true,
});

// Posts
export const fetchPosts = (communityId, page = 1) => {
    return API.get(`/${communityId}`, { params: { page } });
};

export const createPostApi = (communityId, data) => {
    return API.post(`/${communityId}`, data);
};

export const updatePostApi = (communityId, postId, data) => {
    return API.patch(`/${communityId}/${postId}`, data);
};

export const deletePostApi = (communityId, postId) => {
    return API.delete(`/${communityId}/${postId}`);
};

export const reactToPostApi = (communityId, postId, type) => {
    return API.post(`/${communityId}/${postId}/react`, { type });
};

// Comments
export const fetchComments = (postId, page = 1, limit = 10) => {
    return API.get(`/${postId}/comments/`, { params: { page, limit } });
};

export const addCommentApi = (postId, text) => {
    return API.post(`/${postId}/comments/`, { text });
};

export const updateCommentApi = (postId, commentId, text) => {
    return API.patch(`/${postId}/comments/${commentId}`, { text });
};

export const deleteCommentApi = (postId, commentId) => {
    return API.delete(`/${postId}/comments/${commentId}`);
};

export default API;

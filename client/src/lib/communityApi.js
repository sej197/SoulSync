import axios from 'axios';

const API = axios.create({
    baseURL: '/api/community',
    withCredentials: true,  // sends cookie automatically
});

export const fetchCommunities = (search = '') => {
    return API.post('/get-communities', null, {
        params: search ? { search } : {}
    });
};

export const fetchMyCommunities = () => {
    return API.post('/get-my-communities');
};

export const createCommunityApi = (data) => {
    return API.post('/create-community', data);
};

export const joinCommunityApi = (communityId) => {
    return API.post(`/${communityId}/join`);
};

export const leaveCommunityApi = (communityId) => {
    return API.post(`/${communityId}/leave`);
};

export const approveRequestApi = (communityId, userId) => {
    return API.post(`/${communityId}/approve/${userId}`);
};

export const rejectRequestApi = (communityId, userId) => {
    return API.post(`/${communityId}/reject/${userId}`);
};
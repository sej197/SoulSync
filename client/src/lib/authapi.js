import axios from 'axios';

const authapi = axios.create({
    baseURL: `/api/auth`,
    withCredentials: true
});

export const loginUser = async (email, password) => {
    const res = await authapi.post('/login', { email, password });
    return res.data;
};

export const registerUser = async (userData) => {
    const res = await authapi.post('/register', userData);
    return res.data;
};

export const logoutUser = async () => {
    const res = await authapi.post('/logout');
    return res.data;
};

export const checkAuthStatus = async () => {
    const res = await authapi.get('/is-authenticated');
    return res.data;
};

export const updateProfile = async (updateData) => {
    const res = await authapi.patch('/update-profile', updateData);
    return res.data;
};

export default authapi;
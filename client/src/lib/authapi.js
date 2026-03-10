import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { attachToken, saveToken, clearToken } from './tokenManager';

const authapi = axios.create({
    baseURL: `${API_BASE_URL}/api/auth`,
    withCredentials: true
});
authapi.interceptors.request.use(attachToken);

export const loginUser = async (email, password) => {
    const res = await authapi.post('/login', { email, password });
    if (res.data.token) saveToken(res.data.token);
    return res.data;
};

export const registerUser = async (userData) => {
    const res = await authapi.post('/register', userData);
    if (res.data.token) saveToken(res.data.token);
    return res.data;
};

export const logoutUser = async () => {
    const res = await authapi.post('/logout');
    clearToken();
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

export const sendOtp = async () => {
    const res = await authapi.post('/send-otp');
    return res.data;
};

export const verifyOtp = async (otp) => {
    const res = await authapi.post('/verify-otp', { otp });
    return res.data;
};

export const sendResetOtp = async (email) => {
    const res = await authapi.post('/send-reset-otp', { email });
    return res.data;
};

export const resetPassword = async (email, otp, newPassword) => {
    const res = await authapi.post('/reset-password', { email, otp, newPassword });
    return res.data;
};

export default authapi;
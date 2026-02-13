import axios from 'axios';

const authapi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`,
    withCredentials: true
});

export default authapi;
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`,
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request:', config.url, 'Token attached');
        } else {
            console.warn('API Request:', config.url, 'No token found in store');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

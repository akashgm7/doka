import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || '').trim() || `http://${window.location.hostname}:5001`,
});

api.interceptors.request.use(
    (config) => {
        // Use getState() to get the most recent token (even if store just hydrated)
        const state = useAuthStore.getState();
        const token = state.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (import.meta.env.DEV) {
                console.log(`[API] 🚀 Requesting: ${config.url} (Token attached)`);
            }
        } else {
            // Enhanced logging for 401 troubleshooting
            console.warn(`[API] ⚠️ No token found for: ${config.url}. Hydrated: ${state._hasHydrated}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;


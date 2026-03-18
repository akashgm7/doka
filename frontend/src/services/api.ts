import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseURL = () => {
    let url = (import.meta.env.VITE_API_URL || '').trim();
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url || `http://${window.location.hostname}:5001`;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use(
    (config) => {
        const state = useAuthStore.getState();
        const token = state.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (import.meta.env.DEV) {
                console.log(`[API] 🚀 Requesting: ${config.method?.toUpperCase()} ${config.url} (Token: ...${token.slice(-5)})`);
            }
        } else {
            // Enhanced logging for production/debug
            const hasRawStorage = !!localStorage.getItem('auth-storage');
            console.warn(`[API] ⚠️ No token found for: ${config.url}. Hydrated: ${state._hasHydrated}, LS: ${hasRawStorage}, User: ${!!state.user}`);
            
            // Try to recover if possible
            if (hasRawStorage && !token) {
                try {
                    const parsed = JSON.parse(localStorage.getItem('auth-storage') || '{}');
                    const recoveredToken = parsed.state?.token;
                    if (recoveredToken) {
                        console.log('[API] 💡 Recovered token from storage for request');
                        config.headers.Authorization = `Bearer ${recoveredToken}`;
                    }
                } catch (e) {}
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('[API] ❌ 401 Unauthorized received for:', error.config.url);
            // If it's a 401 and we're not on the login page, it's a stale session
            if (!window.location.pathname.includes('/login')) {
                // Clear store and redirect
                // useAuthStore.getState().logout(); // Optional: selective logout?
                console.warn('[API] Redirecting to login due to 401 auth failure.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;


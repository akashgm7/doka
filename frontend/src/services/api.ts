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
            // Check localStorage directly as a fallback to see if hydration is the issue
            const rawStorage = localStorage.getItem('auth-storage');
            let storedToken = null;
            if (rawStorage) {
                try {
                    const parsed = JSON.parse(rawStorage);
                    storedToken = parsed.state?.token;
                } catch (e) {}
            }

            console.warn(`[API] ⚠️ No token found for: ${config.url}.
                Store Hydrated: ${state._hasHydrated}
                Store Token: ${token ? 'exists' : 'null'}
                LocalStorage Token: ${storedToken ? 'exists' : 'null'}
                User: ${state.user ? state.user.name : 'null'}`);
            
            // If store has no token but localStorage DOES, it means hydration issue
            if (!token && storedToken) {
                console.log('[API] 💡 Found token in localStorage that state missed. Attaching anyway.');
                config.headers.Authorization = `Bearer ${storedToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;


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
        // Skip adding token to public routes
        const publicRoutes = ['/api/users/login', '/api/users/register', '/api/users/forgotpassword'];
        const isPublic = publicRoutes.some(route => config.url?.startsWith(route));

        if (isPublic) {
            console.log(`[API] 🔓 Public route detected: ${config.url}`);
            return config;
        }

        const state = useAuthStore.getState();
        const token = state.token || state.user?.token;

        // Validation for a real JWT (should have at least 2 dots and some length)
        const isMalformed = (t: any) => !t || t === 'null' || t === 'undefined' || (typeof t === 'string' && t.split('.').length < 3);

        if (token && !isMalformed(token)) {
            // Only add if not already set (to respect explicit headers in specific calls)
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
                if (import.meta.env.DEV) {
                    console.log(`[API] 🚀 Requesting: ${config.method?.toUpperCase()} ${config.url} (Token: ...${token.slice(-5)})`);
                }
            }
        } else {
            // Enhanced logging for production/debug
            const hasRawStorage = !!localStorage.getItem('auth-storage');
            console.warn(`[API] ⚠️ No valid token found for: ${config.url}. Hydrated: ${state._hasHydrated}, LS: ${hasRawStorage}, User: ${!!state.user}`);
            
            // Try to recover from storage if store is empty but storage exists
            if (hasRawStorage && (!token || isMalformed(token))) {
                try {
                    const parsed = JSON.parse(localStorage.getItem('auth-storage') || '{}');
                    const recoveredToken = parsed.state?.token || parsed.state?.user?.token;
                    if (recoveredToken && !isMalformed(recoveredToken)) {
                        console.log('[API] 💡 Recovered valid token from storage');
                        if (!config.headers.Authorization) {
                            config.headers.Authorization = `Bearer ${recoveredToken}`;
                        }
                    }
                } catch (e) {}
            }
        }

        // Final Verification
        if (config.headers.Authorization) {
            const h = config.headers.Authorization as string;
            if (h.includes('undefined') || h.includes('null')) {
                console.error(`[API] 🛑 CRITICAL: Sending MALFORMED header to ${config.url}:`, h);
            } else if (import.meta.env.DEV || config.url?.includes('cart')) {
                console.log(`[API] 📤 Sending Auth Header to ${config.url}:`, h.substring(0, 20) + '...');
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


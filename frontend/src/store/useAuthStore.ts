import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    isAdmin: boolean;
    role: string;
    token: string;
    addresses: {
        _id: string;
        label: string;
        addressLine: string;
        city: string;
        zipCode: string;
        coordinates: { lat: number; lng: number };
        isDefault: boolean;
    }[];
    loyaltyPoints?: number;
    createdAt?: string;
    favorites?: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    loginTime: string | null;
    _hasHydrated: boolean;
    setCredentials: (user: User) => void;
    updateUser: (userData: Partial<User>) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loginTime: null,
            _hasHydrated: false,
            updateUser: (userData: Partial<User>) => set((state) => {
                const newUserData = state.user ? { ...state.user, ...userData } : null;
                let topToken = userData.token || state.token;
                
                // Defensive check against malformed tokens
                if (topToken === 'null' || topToken === 'undefined') {
                    topToken = null;
                }
                
                return {
                    user: newUserData,
                    token: topToken
                };
            }),
            setCredentials: (user: User) => set((state) => {
                const newToken = user.token || state.token || null;
                
                if (!newToken) {
                    console.warn('[AuthStore] ⚠️ setCredentials called with no token! Session will not be authenticated.');
                }
                
                return {
                    user: { ...user, token: newToken || '' },
                    token: newToken,
                    loginTime: state.loginTime || new Date().toISOString()
                };
            }),
            logout: () => {
                localStorage.removeItem('auth-storage');
                set({ user: null, token: null, loginTime: null });
            },
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);


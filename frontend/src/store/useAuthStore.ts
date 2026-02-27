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
    setCredentials: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loginTime: null,
            setCredentials: (user) => set((state) => ({
                user,
                token: user.token || state.token,
                loginTime: state.loginTime || new Date().toISOString()
            })),
            logout: () => set({ user: null, token: null, loginTime: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);

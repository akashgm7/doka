import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './useAuthStore';

interface FavoritesStore {
    favorites: string[];          // cake IDs for the current user
    isLoading: boolean;
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (cakeId: string) => Promise<void>;
    isFavorite: (cakeId: string) => boolean;
    clearFavorites: () => void;   // called on logout
}

// Validate MongoDB ObjectId format (24 hex chars)
const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    favorites: [],
    isLoading: false,

    fetchFavorites: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;                // not logged in — nothing to fetch
        try {
            set({ isLoading: true });
            const { data } = await api.get('/api/users/favorites');
            set({ favorites: data.favorites });
        } catch (err) {
            console.error('[Favorites] Failed to fetch:', err);
        } finally {
            set({ isLoading: false });
        }
    },

    toggleFavorite: async (cakeId: string) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            console.warn('[Favorites] No token — user must be logged in to favorite.');
            return;
        }

        // Guard: only real MongoDB ObjectIds can be favorited
        if (!isValidObjectId(cakeId)) {
            console.warn(`[Favorites] Skipping toggle — "${cakeId}" is not a valid MongoDB ObjectId.`);
            return;
        }

        // Optimistic update
        const current = get().favorites;
        const isFav = current.includes(cakeId);
        set({ favorites: isFav ? current.filter(id => id !== cakeId) : [...current, cakeId] });

        try {
            const { data } = await api.post(`/api/users/favorites/${cakeId}`);
            // Sync with server truth
            set({ favorites: data.favorites });
        } catch (err: any) {
            // Rollback on failure
            set({ favorites: current });
            console.error('[Favorites] Toggle failed:', err?.response?.data?.message || err);
        }
    },

    isFavorite: (cakeId: string) => get().favorites.includes(cakeId),

    clearFavorites: () => set({ favorites: [] }),
}));

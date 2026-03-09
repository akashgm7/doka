import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    product: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    customization?: {
        shape: string;
        flavour: string;
        design: string;
        size: string;
        message: string;
    };
    isMMC?: boolean;
    addedAt?: string;
}

export type OrderMode = 'dine-in' | 'pickup' | 'delivery';

const syncCartToBackend = async (cartItems: CartItem[]) => {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const { token } = JSON.parse(authStorage).state || {};
            if (token) {
                // Using relative path assuming proxy or same origin, 
                // but fetch needs full URL if not proxied. Better to use api util if possible, 
                // but we don't have it imported easily.
                // We'll import api here:
                const api = (await import('../services/api')).default;
                await api.put('/api/users/cart', { cartItems });
            }
        }
    } catch (err) {
        console.error('Failed to sync cart', err);
    }
};

interface CartState {
    cartItems: CartItem[];
    paymentMethod: string;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    orderMode: OrderMode;
    orderType: 'MMC' | 'READY_MADE' | null;
    addToCart: (item: CartItem) => { success: boolean; error?: string };
    removeFromCart: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    setOrderMode: (mode: OrderMode) => void;
    saveShippingAddress: (data: any) => void;
    savePaymentMethod: (data: string) => void;
    clearCart: () => void;
    resetLocalCart: () => void;
    setCart: (cartItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            shippingAddress: { address: '', city: '', postalCode: '', country: '' },
            paymentMethod: 'PayPal',
            orderMode: 'delivery',
            orderType: null,
            addToCart: (item) => {
                const cartItems = get().cartItems;
                const currentOrderType = get().orderType;

                // Determine item type
                const itemIsMMC = item.isMMC || (item.product && String(item.product).startsWith('mmc-'));
                const itemOrderType = itemIsMMC ? 'MMC' : 'READY_MADE';

                // Check for category conflict
                if (currentOrderType && currentOrderType !== itemOrderType) {
                    return {
                        success: false,
                        error: `Custom cakes and ready-made cakes cannot be ordered together. Please place separate orders.`
                    };
                }

                const existItem = cartItems.find((x) => x.product === item.product);

                let updatedItems;
                if (existItem) {
                    updatedItems = cartItems.map((x) =>
                        x.product === existItem.product ? { ...x, qty: x.qty + item.qty } : x
                    );
                } else {
                    updatedItems = [...cartItems, item];
                }

                set({
                    cartItems: updatedItems,
                    orderType: itemOrderType
                });
                syncCartToBackend(updatedItems);

                return { success: true };
            },
            removeFromCart: (id) => {
                const updatedItems = get().cartItems.filter((x) => x.product !== id);

                let newOrderType = null;
                if (updatedItems.length > 0) {
                    const hasMMC = updatedItems.some(item => item.isMMC || (item.product && String(item.product).startsWith('mmc-')));
                    newOrderType = hasMMC ? 'MMC' : 'READY_MADE';
                }

                set({ cartItems: updatedItems, orderType: newOrderType });
                syncCartToBackend(updatedItems);
            },
            updateQty: (id, qty) => {
                if (qty < 1) return;
                const updatedItems = get().cartItems.map((x) =>
                    x.product === id ? { ...x, qty } : x
                );
                set({ cartItems: updatedItems });
                syncCartToBackend(updatedItems);
            },
            setOrderMode: (mode) => set({ orderMode: mode }),
            saveShippingAddress: (data) => set({ shippingAddress: data }),
            savePaymentMethod: (data) => set({ paymentMethod: data }),
            clearCart: () => {
                set({ cartItems: [], orderMode: 'delivery', orderType: null });
                syncCartToBackend([]);
            },
            resetLocalCart: () => set({ cartItems: [], orderMode: 'delivery', orderType: null }),
            setCart: (cartItems) => {
                let newOrderType = null;
                if (cartItems.length > 0) {
                    const hasMMC = cartItems.some(item => item.isMMC || (item.product && String(item.product).startsWith('mmc-')));
                    newOrderType = hasMMC ? 'MMC' : 'READY_MADE';
                }
                set({ cartItems, orderType: newOrderType });
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);

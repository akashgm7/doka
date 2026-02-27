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
    addToCart: (item: CartItem) => void;
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
            addToCart: (item) => {
                const cartItems = get().cartItems;
                const existItem = cartItems.find((x) => x.product === item.product);

                if (existItem) {
                    const updatedItems = cartItems.map((x) =>
                        x.product === existItem.product ? { ...x, qty: x.qty + item.qty } : x
                    );
                    set({ cartItems: updatedItems });
                    syncCartToBackend(updatedItems);
                } else {
                    const updatedItems = [...cartItems, item];
                    set({ cartItems: updatedItems });
                    syncCartToBackend(updatedItems);
                }
            },
            removeFromCart: (id) => {
                const updatedItems = get().cartItems.filter((x) => x.product !== id);
                set({ cartItems: updatedItems });
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
                set({ cartItems: [], orderMode: 'delivery' });
                syncCartToBackend([]);
            },
            resetLocalCart: () => set({ cartItems: [], orderMode: 'delivery' }),
            setCart: (cartItems) => set({ cartItems }),
        }),
        {
            name: 'cart-storage',
        }
    )
);

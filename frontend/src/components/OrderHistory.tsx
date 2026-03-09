import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import CakePreview3D from '../components/CakePreview3D';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import TrackingModal from './TrackingModal';
import FeedbackModal from './FeedbackModal';
import { resolveImageUrl } from '../utils/imageUrl';
import ConflictModal from './ConflictModal';



interface OrderHistoryProps {
    className?: string;
    showTitle?: boolean;
}

const OrderHistory = ({ className = '', showTitle = true }: OrderHistoryProps) => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [trackingOrder, setTrackingOrder] = useState<any>(null);
    const [feedbackOrder, setFeedbackOrder] = useState<any>(null);
    const addToCart = useCartStore(state => state.addToCart);

    const navigate = useNavigate();

    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [pendingItems, setPendingItems] = useState<any[]>([]);

    const handleReorder = (order: any) => {
        const items = order.orderItems.map((item: any) => ({
            product: item.product || item._id, // product ID
            name: item.name,
            price: item.price,
            image: item.image,
            qty: item.qty || 1,
            customization: item.customization ? {
                shape: item.customization.shape,
                flavour: item.customization.flavour,
                design: item.customization.design,
                size: item.customization.size,
                message: item.customization.message
            } : undefined
        }));

        if (items.length > 0) {
            const firstResult = addToCart(items[0]);
            if (!firstResult.success) {
                setPendingItems(items);
                setConflictModalOpen(true);
                return;
            }
            items.slice(1).forEach((item: any) => addToCart(item));
            navigate('/cart');
        }
    };

    const handleConfirmClear = () => {
        useCartStore.getState().clearCart();
        pendingItems.forEach(item => addToCart(item));
        setConflictModalOpen(false);
        setPendingItems([]);
        navigate('/cart');
    };


    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/api/orders/myorders?t=${Date.now()}`);
            console.log('OrderHistory: Raw Data from API:', data);
            console.log('OrderHistory: Count:', Array.isArray(data) ? data.length : 'Not an array');

            // Ensure data is an array
            if (Array.isArray(data)) {
                setOrders(data);
            } else if (data && typeof data === 'object' && 'orders' in data) {
                // Handle cases where backend might return { orders: [...] }
                setOrders((data as any).orders);
            } else {
                console.warn('OrderHistory: API returned unexpected data format:', data);
                setOrders([]);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`space-y-8 ${className}`}
        >
            {showTitle && <h2 className="text-3xl font-serif font-bold text-text-main mb-8">Order History</h2>}

            {isLoading ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-black/5 shadow-sm">
                    <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-6"></div>
                    <p className="text-text-muted/60 font-serif">Curating your past orders...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-600 bg-red-50 border border-red-100 rounded-3xl">
                    <p className="font-bold text-sm mb-4">{error}</p>
                    <button onClick={fetchOrders} className="text-xs font-bold uppercase tracking-widest text-text-main hover:text-accent transition-colors">Try Again</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-black/5 shadow-sm">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted/20">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-text-main mb-3">No Orders Yet</h3>
                    <p className="text-text-muted/40 mb-10 max-w-sm mx-auto text-sm leading-relaxed">It seems your collection is empty. Explore our boutique to find your perfect masterpiece.</p>
                    <Link to="/shop" className="inline-block bg-gradient-to-r from-accent to-accent-light text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-accent/20 transition-all uppercase tracking-[0.15em] text-[10px]">
                        Enter Boutique
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-[2.5rem] border border-black/5 p-8 shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent/10 group-hover:bg-accent transition-colors duration-500" />

                            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 pb-8 border-b border-black/5 gap-6">
                                <div className="flex gap-10">
                                    <div>
                                        <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] font-bold mb-2">Order Ref</p>
                                        <p className="text-sm font-mono font-bold text-text-main tracking-widest bg-primary px-3 py-1 rounded-lg border border-black/5">#{order._id.substring(order._id.length - 8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] font-bold mb-2">Order Date</p>
                                        <p className="text-sm font-bold text-text-main opacity-90">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] font-bold mb-2">Total Amount</p>
                                        <p className="text-sm font-serif font-bold text-accent">₹{order.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Status Badges */}
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm ${order.isPaid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {order.isPaid ? 'Settled' : 'Pending Payment'}
                                    </span>
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm ${order.isDelivered || order.status === 'DELIVERED'
                                        ? 'bg-accent/10 text-accent border-accent/20'
                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {order.isDelivered || order.status === 'DELIVERED' ? 'Delivered' : 'In Preparation'}
                                    </span>

                                    <div className="h-8 w-[1px] bg-black/5 mx-2 hidden lg:block" />

                                    {!(order.status === 'DELIVERED' || order.isDelivered) ? (
                                        <button
                                            onClick={() => setTrackingOrder(order)}
                                            className="text-[10px] font-bold text-text-muted/60 bg-primary border border-black/5 px-6 py-2.5 rounded-xl hover:bg-white hover:text-accent hover:border-accent/40 transition-all uppercase tracking-widest shadow-sm"
                                        >
                                            Track Order
                                        </button>
                                    ) : !order.feedback?.rating && (
                                        <button
                                            onClick={() => setFeedbackOrder(order)}
                                            className="text-[10px] font-bold text-accent bg-accent/5 border border-accent/20 px-6 py-2.5 rounded-xl hover:bg-accent hover:text-white transition-all uppercase tracking-widest shadow-sm"
                                        >
                                            Leave Feedback
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleReorder(order)}
                                        className="text-[10px] font-bold text-white bg-text-main px-6 py-2.5 rounded-xl hover:bg-accent transition-all uppercase tracking-widest shadow-lg shadow-text-main/10"
                                    >
                                        Reorder
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {order.orderItems.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center gap-5 p-4 bg-primary/50 rounded-2xl border border-black/[0.03] group-hover:bg-white group-hover:border-black/5 transition-all duration-500">
                                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 relative border border-black/5 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                            {item.customization && (item.customization.shape || item.customization.flavour) ? (
                                                <div className="w-full h-full pointer-events-none scale-[0.6]">
                                                    <CakePreview3D
                                                        shape={item.customization.shape}
                                                        flavour={item.customization.flavour}
                                                        design={item.customization.design}
                                                        size={item.customization.size}
                                                        cakeMessage={item.customization.message}
                                                        interactive={false}
                                                        autoRotate={false}
                                                        scale={0.5}
                                                    />
                                                </div>
                                            ) : item.image ? (
                                                <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted/20">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-text-main truncate group-hover:text-accent transition-colors">{item.name || 'Bespoke Creation'}</h4>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-text-muted/40 font-bold uppercase tracking-widest">{item.qty || 1} Unit{item.qty > 1 ? 's' : ''}</span>
                                                <span className="text-text-muted/20">•</span>
                                                <span className="text-[10px] font-serif font-bold text-accent">₹{((item.qty || 1) * (item.price || 0)).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {trackingOrder && (
                <TrackingModal
                    order={trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                    onDelivered={() => {
                        // Optimistically mark as delivered in local state immediately
                        setOrders(prev =>
                            prev.map(o =>
                                o._id === trackingOrder._id
                                    ? { ...o, status: 'DELIVERED', isDelivered: true }
                                    : o
                            )
                        );
                        setTrackingOrder(null);
                        fetchOrders(); // also re-fetch to sync with DB
                    }}
                />
            )}

            {feedbackOrder && (
                <FeedbackModal
                    order={feedbackOrder}
                    onClose={() => setFeedbackOrder(null)}
                    onSubmitted={(updatedOrder) => {
                        setOrders(prev =>
                            prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
                        );
                        setFeedbackOrder(null);
                    }}
                />
            )}

            {/* Conflict Modal */}
            <ConflictModal
                isOpen={conflictModalOpen}
                onClose={() => {
                    setConflictModalOpen(false);
                    setPendingItems([]);
                }}
                onConfirmClear={handleConfirmClear}
            />
        </motion.div>
    );

};

export default OrderHistory;

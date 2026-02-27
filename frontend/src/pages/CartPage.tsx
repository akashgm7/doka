import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useState } from 'react';
import { UtensilsCrossed, PackageCheck, Truck, Trash2, MapPin, Plus, Sparkles, Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import OrderHistory from '../components/OrderHistory';
import CakePreview3D from '../components/CakePreview3D';
import { addOns } from '../data/addOns';
import AddOnCard from '../components/AddOnCard';
import { resolveImageUrl } from '../utils/imageUrl';

const CartPage = () => {
    const cartItems = useCartStore((state) => state.cartItems);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQty = useCartStore((state) => state.updateQty);
    const clearCart = useCartStore((state) => state.clearCart);

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const { user, setCredentials } = useAuthStore();
    const navigate = useNavigate();
    const { orderMode, setOrderMode } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showClearCart, setShowClearCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        () => user?.addresses?.[0]?._id || ''
    );

    const hasCustomCake = cartItems.some(item => item.isMMC || item.product.startsWith('mmc-'));
    const DELIVERY_FEE = 8;

    if (hasCustomCake && orderMode !== 'delivery') setOrderMode('delivery');

    const ORDER_MODES = [
        { id: 'dine-in' as const, label: 'Dine-in', desc: 'Enjoy at our atelier', icon: UtensilsCrossed },
        { id: 'pickup' as const, label: 'Pickup', desc: 'Collect from boutique', icon: PackageCheck },
        { id: 'delivery' as const, label: 'Delivery', desc: 'Delivered to you', icon: Truck },
    ];

    const checkoutHandler = async () => {
        if (!user) { navigate('/login?redirect=cart'); return; }
        if (orderMode === 'delivery') {
            if (!user.addresses || user.addresses.length === 0) {
                setError('Please add a delivery address in your profile before placing a delivery order.');
                return;
            }
            if (!selectedAddressId) {
                setError('Please select a delivery address.');
                return;
            }
        }
        setLoading(true); setError('');
        try {
            const selectedAddr = user?.addresses?.find(a => a._id === selectedAddressId);
            const shippingAddress = selectedAddr
                ? { address: selectedAddr.addressLine, city: selectedAddr.city, postalCode: selectedAddr.zipCode, country: 'IN', label: selectedAddr.label }
                : { address: 'N/A - Pickup/Dine-In', city: '', postalCode: '', country: 'IN' };

            const orderData = {
                orderItems: cartItems,
                orderMode,
                shippingAddress,
                paymentMethod: 'PayPal',
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: orderMode === 'delivery' ? DELIVERY_FEE : 0,
                totalPrice: totalPrice + (orderMode === 'delivery' ? DELIVERY_FEE : 0) - pointsToRedeem,
                redeemedLoyaltyPoints: pointsToRedeem,
            };

            const response = await api.post('/api/orders', orderData);
            if (response.data.newLoyaltyPoints !== undefined && user) {
                setCredentials({ ...user, loyaltyPoints: response.data.newLoyaltyPoints });
            }
            clearCart();
            setShowSuccess(true);
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || 'Order failed. Please try again.';
            setError(`❌ ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-primary">
            {/* Ambient effects */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute top-3/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-8">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10">
                        <ShoppingBag className="w-6 h-6 text-accent/70" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-text-main">Your Atelier Box</h1>
                        <p className="text-[10px] text-text-muted/60 uppercase tracking-[0.3em] font-bold mt-1">Curated Artisanal Selection</p>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-black/5 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-text-muted/20" />
                        </div>
                        <p className="text-xl text-text-muted/40 mb-8 font-serif">Your box is currently empty.</p>
                        <Link to="/ready-made" className="inline-block px-10 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-accent to-accent-light hover:scale-[1.02] transition-all shadow-xl shadow-accent/20">
                            Explore the Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Policy Notice */}
                            <div className="bg-accent/5 border border-accent/10 p-5 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-accent/20 shadow-sm">
                                    <Clock className="w-5 h-5 text-accent" />
                                </div>
                                <p className="text-sm text-text-muted/80 leading-relaxed">
                                    <span className="font-bold text-text-main">Atelier Policy:</span> Your artisanal selections are preserved for <span className="text-accent font-bold">24 hours</span> to ensure maximum freshness and availability.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.product}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm relative group transition-all duration-500 hover:shadow-xl hover:shadow-accent/5"
                                    >
                                        <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 relative bg-primary border border-black/5 mb-4 sm:mb-0">
                                            {item.customization ? (
                                                <div className="w-full h-full pointer-events-none">
                                                    <CakePreview3D
                                                        shape={item.customization.shape}
                                                        flavour={item.customization.flavour}
                                                        design={item.customization.design}
                                                        size={item.customization.size}
                                                        cakeMessage={item.customization.message}
                                                        interactive={false}
                                                        autoRotate={false}
                                                        scale={0.65}
                                                    />
                                                </div>
                                            ) : (
                                                <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            )}
                                        </div>
                                        <div className="sm:ml-8 flex-1 w-full relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-[9px] text-accent uppercase tracking-[0.2em] font-bold mb-1.5">{item.isMMC ? 'Custom Enclave' : 'Artisanal Ready'}</p>
                                                    <Link to={`/product/${item.product}`} className="text-xl font-serif font-bold text-text-main hover:text-accent transition-colors leading-tight block line-clamp-2 max-w-[280px]">
                                                        {item.name}
                                                    </Link>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-text-muted/60 mb-0.5">₹{item.price.toFixed(2)}</p>
                                                    <p className="font-serif font-bold text-xl text-accent">₹{(item.price * item.qty).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="flex items-center bg-primary rounded-xl border border-black/5 overflow-hidden shadow-inner">
                                                    <button
                                                        onClick={() => updateQty(item.product, item.qty - 1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-10 h-10 flex items-center justify-center text-text-muted/40 hover:text-accent hover:bg-white transition-all disabled:opacity-20 font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-10 text-center font-bold text-sm text-text-main">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.product, item.qty + 1)}
                                                        className="w-10 h-10 flex items-center justify-center text-text-muted/40 hover:text-accent hover:bg-white transition-all font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setItemToDelete(item.product);
                                                    }}
                                                    className="flex items-center gap-2 text-text-muted/40 hover:text-red-500 transition-all font-bold text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-red-50 rounded-xl"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-start">
                                <button
                                    onClick={() => setShowClearCart(true)}
                                    className="text-[10px] font-bold text-text-muted/30 hover:text-red-500 flex items-center gap-2 transition-all px-6 py-3 hover:bg-red-50 rounded-2xl uppercase tracking-[0.2em]"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Empty Atelier Box
                                </button>
                            </div>

                            {/* Suggested Add-ons */}
                            <div className="mt-16 pt-10 border-t border-black/5">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-accent/60" />
                                        <h3 className="text-xl font-serif font-bold text-text-main">Elevate Your Experience</h3>
                                    </div>
                                    <Link to="/add-ons" className="text-[10px] font-bold text-accent hover:text-text-main transition-colors flex items-center gap-2 uppercase tracking-[0.2em]">
                                        Explore Essentials <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
                                    {addOns
                                        .filter(addon => !cartItems.some(item => item.product === addon.id))
                                        .map((addon) => (
                                            <div key={addon.id} className="min-w-[180px] flex-shrink-0">
                                                <AddOnCard item={addon} compact={true} />
                                            </div>
                                        ))}
                                    <Link
                                        to="/add-ons"
                                        className="min-w-[180px] flex-shrink-0 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-black/5 hover:border-accent/40 hover:bg-accent/[0.02] transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted/40 group-hover:text-text-main transition-colors text-center px-4">See More<br />Add-ons</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl shadow-accent/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                                    <h2 className="text-2xl font-serif font-bold text-text-main mb-8 border-b border-black/5 pb-6">Final Summary</h2>

                                    <div className="space-y-5 mb-10">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted/70">Signature Items</span>
                                            <span className="font-bold text-text-main">₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted/70">Premium Fulfillment</span>
                                            <span className="font-bold text-text-main">
                                                {orderMode === 'delivery' ? `₹${DELIVERY_FEE.toFixed(2)}` : 'Complimentary'}
                                            </span>
                                        </div>

                                        {pointsToRedeem > 0 && (
                                            <div className="flex justify-between text-xs text-accent font-bold px-3 py-2 bg-accent/5 rounded-lg border border-accent/10">
                                                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Loyalty Applied</span>
                                                <span>-₹{pointsToRedeem.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t border-black/5 pt-6 mt-6 flex justify-between items-end">
                                            <span className="font-bold text-xs text-text-muted/40 uppercase tracking-[0.2em]">Total Due</span>
                                            <span className="font-serif font-bold text-3xl text-accent">
                                                ₹{(totalPrice + (orderMode === 'delivery' ? DELIVERY_FEE : 0) - pointsToRedeem).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Loyalty Redemption */}
                                    {user && (user.loyaltyPoints || 0) > 0 && (
                                        <div className="pt-8 border-t border-black/5 mb-10">
                                            <div className="flex justify-between items-center mb-5">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-accent/60" />
                                                    <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest">Atelier Loyalty</h3>
                                                </div>
                                                <span className="text-[9px] font-bold text-accent bg-accent/5 px-2.5 py-1 rounded-full border border-accent/10">Balance: {user.loyaltyPoints}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={Math.min(user.loyaltyPoints || 0, Math.floor(totalPrice + (orderMode === 'delivery' ? DELIVERY_FEE : 0)))}
                                                    value={pointsToRedeem || ''}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        const maxPossible = Math.min(user.loyaltyPoints || 0, Math.floor(totalPrice + (orderMode === 'delivery' ? DELIVERY_FEE : 0)));
                                                        setPointsToRedeem(Math.max(0, Math.min(val, maxPossible)));
                                                    }}
                                                    className="flex-1 bg-primary border border-black/5 rounded-2xl px-5 py-3.5 text-sm text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/40 shadow-inner font-bold"
                                                    placeholder="Redeem pts"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const maxPossible = Math.min(user.loyaltyPoints || 0, Math.floor(totalPrice + (orderMode === 'delivery' ? DELIVERY_FEE : 0)));
                                                        setPointsToRedeem(maxPossible);
                                                    }}
                                                    className="px-5 py-3.5 bg-text-main text-white hover:bg-accent text-[10px] font-bold rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                                                >
                                                    Max
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Method */}
                                    <div className="pt-8 border-t border-black/5 mb-10">
                                        <h3 className="text-[10px] font-bold text-text-muted/40 mb-5 uppercase tracking-widest">Fulfillment Method</h3>
                                        <div className="flex flex-col gap-3">
                                            {ORDER_MODES.map((mode) => {
                                                const Icon = mode.icon;
                                                const isSelected = orderMode === mode.id;
                                                const isLocked = hasCustomCake && mode.id !== 'delivery';
                                                return (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => !isLocked && setOrderMode(mode.id)}
                                                        disabled={isLocked}
                                                        className={`relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-400 ${isLocked
                                                            ? 'border-black/5 bg-primary opacity-30 cursor-not-allowed grayscale'
                                                            : isSelected
                                                                ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5'
                                                                : 'border-black/5 bg-white hover:border-accent/40 hover:bg-primary/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isSelected ? 'bg-accent text-white border-accent' : 'bg-primary border-black/5 text-text-muted/40'}`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className={`text-sm font-bold leading-none mb-1.5 ${isSelected ? 'text-text-main' : 'text-text-muted'}`}>{mode.label}</p>
                                                                <p className="text-[10px] text-text-muted/50 font-medium">{mode.desc}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-accent bg-white shadow-inner' : 'border-black/5'}`}>
                                                            {isSelected && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {hasCustomCake && (
                                            <div className="mt-4 text-[10px] text-accent font-bold bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 flex-shrink-0" />
                                                <span className="leading-relaxed">Custom masterpieces require our specialized climate-controlled logistics for guaranteed perfection.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Address (If Delivery) */}
                                    <AnimatePresence>
                                        {orderMode === 'delivery' && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="pt-8 border-t border-black/5 mb-10">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <h3 className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5 text-accent/60" /> Delivery Address
                                                        </h3>
                                                        <Link to="/profile?tab=addresses" className="text-[10px] text-accent hover:text-text-main transition-colors flex items-center gap-2 uppercase font-bold tracking-widest bg-accent/5 px-3 py-1.5 rounded-full border border-accent/10">
                                                            <Plus className="w-3.5 h-3.5" /> Manage
                                                        </Link>
                                                    </div>

                                                    {(!user?.addresses || user.addresses.length === 0) ? (
                                                        <div className="bg-primary/50 border border-dashed border-black/10 rounded-2xl p-6 text-center">
                                                            <p className="text-xs text-text-muted/60 mb-4">No destination selected.</p>
                                                            <Link to="/profile?tab=addresses" className="inline-block bg-accent px-6 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20">Add Address</Link>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                            {user.addresses.map((addr) => (
                                                                <button
                                                                    key={addr._id}
                                                                    onClick={() => setSelectedAddressId(addr._id)}
                                                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${selectedAddressId === addr._id
                                                                        ? 'border-accent bg-accent/[0.03]'
                                                                        : 'border-black/5 bg-white hover:border-accent/30'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                        <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${selectedAddressId === addr._id ? 'text-accent' : 'text-text-muted/60'}`}>{addr.label}</p>
                                                                        {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/50" />}
                                                                    </div>
                                                                    <p className="text-xs text-text-main font-bold truncate">{addr.addressLine}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {error && (
                                        <div className="flex gap-3 text-red-600 text-[11px] font-bold mt-6 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                            <div className="shrink-0 pt-0.5">⚠️</div>
                                            <p className="leading-relaxed">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => user ? checkoutHandler() : navigate('/login?redirect=cart')}
                                        disabled={loading}
                                        className={`w-full py-5 rounded-[2rem] font-bold text-sm tracking-[0.15em] uppercase transition-all shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8 ${user
                                            ? 'bg-gradient-to-r from-accent to-accent-light text-white shadow-accent/30 hover:shadow-accent/40'
                                            : 'bg-text-main text-white hover:bg-black'
                                            }`}
                                    >
                                        {loading ? 'Processing...' : user ? 'Place Your Order' : 'Sign in to Continue'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {/* Delete Modal */}
                {itemToDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-primary/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl"
                        onClick={() => setItemToDelete(null)}
                    >
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[3rem] p-10 max-w-sm w-full border border-black/5 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100">
                                <Trash2 className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-text-main mb-3">Remove Selection?</h3>
                            <p className="text-text-muted/60 mb-10 text-sm leading-relaxed">
                                Are you sure you wish to remove <span className="text-accent font-bold">"{cartItems.find(i => i.product === itemToDelete)?.name}"</span> from your box?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { removeFromCart(itemToDelete); setItemToDelete(null); }} className="w-full py-4 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Remove Permanently</button>
                                <button onClick={() => setItemToDelete(null)} className="w-full py-4 text-text-muted/40 text-sm font-bold hover:text-text-main transition-colors uppercase tracking-widest">Keep Selection</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Clear Modal */}
                {showClearCart && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-primary/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl"
                        onClick={() => setShowClearCart(false)}
                    >
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[3rem] p-10 max-w-sm w-full border border-black/5 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100">
                                <Trash2 className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-text-main mb-3">Empty Your Box?</h3>
                            <p className="text-text-muted/60 mb-10 text-sm leading-relaxed">This action will clear all artisanal items from your current selection. This cannot be undone.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { clearCart(); setShowClearCart(false); }} className="w-full py-4 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Yes, Clear Everything</button>
                                <button onClick={() => setShowClearCart(false)} className="w-full py-4 text-text-muted/40 text-sm font-bold hover:text-text-main transition-colors uppercase tracking-widest">No, Keep My Box</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Success Modal */}
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/95 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl"
                    >
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[4rem] p-12 max-w-md w-full border border-accent/10 shadow-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-accent to-transparent" />
                            <div className="w-24 h-24 bg-accent/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-accent/10 shadow-inner">
                                <PackageCheck className="w-12 h-12 text-accent" />
                            </div>
                            <h2 className="text-4xl font-serif font-bold text-text-main mb-4">Request Secured</h2>
                            <p className="text-text-muted/60 text-sm mb-12 leading-relaxed max-w-[280px] mx-auto">Our master pâtissiers have received your order and will begin the artisanal preparation shortly.</p>
                            <div className="space-y-4">
                                <Link to="/profile?tab=orders" className="block w-full bg-text-main text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all">Track Order Status</Link>
                                <Link to="/shop" className="block w-full py-5 text-accent font-bold text-xs uppercase tracking-[0.2em] hover:text-text-main transition-colors">Return to Boutique</Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {user && (
                <div className="max-w-5xl mx-auto px-4 mt-24 relative z-10 pt-16 border-t border-black/5">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10">
                            <Sparkles className="w-5 h-5 text-accent/60" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-text-main">Order History</h2>
                    </div>
                    <OrderHistory showTitle={false} />
                </div>
            )}
        </div>
    );
};

export default CartPage;

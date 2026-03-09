import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingBag, UtensilsCrossed, PackageCheck, Truck } from 'lucide-react';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';
import CakeCard from '../components/CakeCard';
import ConflictModal from '../components/ConflictModal';

interface Cake {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
    rating?: number;
    numReviews?: number;
    countInStock?: number;
    isEggless?: boolean;
}

const categories = ['All', 'Chocolate', 'Fruit', 'Cheesecake', 'Classic', 'Premium', 'Exotic'];

const ReadyMadeCakesPage = () => {
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [egglessFilter, setEgglessFilter] = useState<boolean | null>(null);
    const addToCart = useCartStore((state) => state.addToCart);
    const { orderMode, setOrderMode, cartItems } = useCartStore();

    const hasCustomCake = cartItems.some(item => item.isMMC || item.product.startsWith('mmc-'));

    useEffect(() => {
        if (hasCustomCake && orderMode !== 'delivery') {
            setOrderMode('delivery');
        }
    }, [hasCustomCake, orderMode, setOrderMode]);

    const ORDER_MODES = [
        { id: 'dine-in' as const, label: 'Dine-in', desc: 'Enjoy at our café', icon: UtensilsCrossed },
        { id: 'pickup' as const, label: 'Pickup', desc: 'Collect from store', icon: PackageCheck },
        { id: 'delivery' as const, label: 'Delivery', desc: 'Delivered to you', icon: Truck },
    ] as const;

    const fetchCakes = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (egglessFilter !== null) {
                params.eggless = egglessFilter;
            }
            const { data } = await api.get('/api/cakes', { params });
            // The API returns { cakes, page, pages }
            const cakeList = data.cakes || data || [];
            setCakes(cakeList);
        } catch {
            setCakes([
                { _id: '1', name: 'Classic Chocolate Truffle', price: 45, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', category: 'Chocolate', description: 'Rich dark chocolate layers with ganache', rating: 4.9, isEggless: true },
                { _id: '2', name: 'Strawberry Delight', price: 38, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600', category: 'Fruit', description: 'Fresh strawberries on cream sponge', rating: 4.7, isEggless: false },
                { _id: '3', name: 'Red Velvet Dream', price: 52, image: 'https://images.unsplash.com/photo-1616429562772-5264b971a8f9?w=600', category: 'Classic', description: 'Classic red velvet with cream cheese frosting', rating: 4.8, isEggless: true },
                { _id: '4', name: 'Mango Passion', price: 42, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600', category: 'Fruit', description: 'Tropical mango with passion fruit glaze', rating: 4.6, isEggless: false },
                { _id: '5', name: 'Pistachio Rose', price: 65, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600', category: 'Premium', description: 'Persian pistachio with rose water', rating: 5.0, isEggless: true },
                { _id: '6', name: 'Blueberry Cheesecake', price: 48, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', category: 'Cheesecake', description: 'New York style with blueberry compote', rating: 4.8, isEggless: false },
                { _id: '7', name: 'Dark Forest', price: 55, image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600', category: 'Chocolate', description: 'Black forest with Kirsch cherries', rating: 4.9, isEggless: true },
                { _id: '8', name: 'Lemon Drizzle', price: 35, image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600', category: 'Classic', description: 'Tangy lemon sponge with sugar glaze', rating: 4.5, isEggless: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCakes();
    }, [egglessFilter]);

    const filteredCakes = cakes.filter((cake) => {
        const matchesSearch = cake.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || cake.category === activeCategory;
        const matchesDietary = egglessFilter === null || cake.isEggless === egglessFilter;
        return matchesSearch && matchesCategory && matchesDietary;
    });

    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [pendingCake, setPendingCake] = useState<Cake | null>(null);

    const handleAddToCart = (cake: Cake) => {
        const item = {
            product: cake._id,
            name: cake.name,
            image: cake.image,
            price: cake.price,
            qty: 1,
        };
        const result = addToCart(item);

        if (!result.success) {
            setPendingCake(cake);
            setConflictModalOpen(true);
        }
    };

    const handleConfirmClear = () => {
        if (pendingCake) {
            useCartStore.getState().clearCart();
            addToCart({
                product: pendingCake._id,
                name: pendingCake.name,
                image: pendingCake.image,
                price: pendingCake.price,
                qty: 1,
            });
            setConflictModalOpen(false);
            setPendingCake(null);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-primary">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-left"
                    >
                        <span className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold">Ready to Order</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main mt-2">Ready Made Cakes</h1>
                        <p className="text-text-muted/80 mt-3 max-w-sm text-sm leading-relaxed">
                            Hand-crafted with love, ready for instant delivery or pickup.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
                    >
                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
                            <input
                                type="text"
                                placeholder="Search the collection..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm text-text-main focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-muted/40 shadow-sm"
                            />
                        </div>

                        {/* Category Tags */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat
                                        ? 'bg-gradient-to-r from-accent to-accent-light text-white border-transparent shadow-lg shadow-accent/20'
                                        : 'bg-white text-text-muted/80 border-black/5 hover:border-accent/30 hover:text-text-main shadow-sm'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Dietary Filter Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-black/5 shadow-sm flex gap-1">
                        {[
                            { label: 'All', value: null },
                            { label: 'Eggless', value: true },
                            { label: 'With Egg', value: false }
                        ].map((option) => (
                            <button
                                key={option.label}
                                onClick={() => setEgglessFilter(option.value)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${egglessFilter === option.value
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'text-text-muted hover:bg-black/5 hover:text-text-main'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Mode Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 bg-white p-5 rounded-3xl border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
                            <UtensilsCrossed className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-text-main uppercase tracking-widest leading-none">Order Mode</h3>
                            <p className="text-[10px] text-text-muted/70 mt-1.5 uppercase tracking-wider">Select your fulfillment method</p>
                        </div>
                    </div>

                    <div className="flex gap-2 bg-primary border border-black/5 p-1.5 rounded-2xl">
                        {ORDER_MODES.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = orderMode === mode.id;
                            const isLocked = hasCustomCake && mode.id !== 'delivery';
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => !isLocked && setOrderMode(mode.id)}
                                    disabled={isLocked}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 relative ${isLocked
                                        ? 'opacity-30 cursor-not-allowed grayscale'
                                        : isSelected
                                            ? 'text-text-main shadow-sm'
                                            : 'text-text-muted/70 hover:text-text-main hover:bg-black/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected && !isLocked ? 'text-accent' : ''}`} />
                                    <span className="text-xs font-bold whitespace-nowrap z-10">{mode.label}</span>
                                    {isSelected && !isLocked && (
                                        <motion.div layoutId="mode-pill-light" className="absolute inset-0 bg-white rounded-xl -z-10 border border-black/5 shadow-sm" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {hasCustomCake && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-500 rounded-xl border border-blue-100 text-[10px] font-medium">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Custom cake in cart: Delivery required.</span>
                        </div>
                    )}
                </motion.div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
                    <p className="text-xs text-text-muted/60 uppercase tracking-widest font-semibold">{filteredCakes.length} Masterpiece{filteredCakes.length !== 1 ? 's' : ''} found</p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 animate-pulse">
                                <div className="aspect-[4/5] bg-white/5" />
                                <div className="p-6 space-y-4">
                                    <div className="h-2.5 bg-white/10 rounded w-1/3" />
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                    <div className="h-10 mt-4 bg-white/10 rounded-xl w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCakes.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-black/5 shadow-sm">
                        <Filter className="w-12 h-12 text-accent/20 mx-auto mb-5" />
                        <h3 className="text-xl font-serif font-bold text-text-main">No creations found</h3>
                        <p className="text-sm text-text-muted/80 mt-2">Try adjusting your curated search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                        {filteredCakes.map((cake) => (
                            <div key={cake._id} className="relative group">
                                <CakeCard
                                    id={cake._id}
                                    name={cake.name}
                                    price={cake.price}
                                    image={cake.image}
                                    rating={cake.rating || 5.0}
                                    brand="DOKA ATELIER"
                                    isEggless={cake.isEggless}
                                />
                                {/* Add to cart overlay button that matches the new design */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddToCart(cake);
                                    }}
                                    className="absolute bottom-6 right-6 z-20 w-10 h-10 bg-white/80 hover:bg-accent border border-black/5 hover:border-accent backdrop-blur-md rounded-full flex items-center justify-center text-text-main hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300"
                                    title="Add to Cart"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conflict Modal */}
                <ConflictModal
                    isOpen={conflictModalOpen}
                    onClose={() => {
                        setConflictModalOpen(false);
                        setPendingCake(null);
                    }}
                    pendingItem={pendingCake}
                    onConfirmClear={handleConfirmClear}
                />
            </div>
        </div>
    );
};

export default ReadyMadeCakesPage;

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { addOns } from '../data/addOns';
import AddOnCard from '../components/AddOnCard';
import { Sparkles, ArrowLeft, Star, Clock, ShieldCheck, ChevronRight, Plus } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';

interface Cake {
    _id: string;
    name: string;
    image: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    countInStock: number;
    rating: number;
    numReviews: number;
}

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cake, setCake] = useState<Cake | null>(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const addToCart = useCartStore((state) => state.addToCart);

    useEffect(() => {
        const fetchCake = async () => {
            try {
                const { data } = await api.get(`/api/cakes/${id}`);
                setCake(data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCake();
    }, [id]);

    const handleAddToCart = () => {
        if (cake) {
            addToCart({
                product: cake._id,
                name: cake.name,
                image: cake.image,
                price: cake.price,
                qty,
            });
            navigate('/cart');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-primary">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-2 border-accent-light rounded-full animate-spin direction-reverse"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-accent animate-pulse" />
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="text-center bg-red-50 border border-red-100 text-red-500 p-8 rounded-2xl max-w-md shadow-sm">
                <p className="text-lg font-bold mb-2">Unable to load details</p>
                <p className="text-sm opacity-80">{error}</p>
                <Link to="/shop" className="inline-block mt-6 px-6 py-2 bg-white border border-black/5 rounded-full text-text-main text-sm hover:bg-surface transition-colors">Return to Boutique</Link>
            </div>
        </div>
    );

    if (!cake) return null;

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-primary">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-10 blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <Link to="/shop" className="inline-flex items-center gap-2 text-text-muted/80 hover:text-accent mb-8 transition-colors text-sm font-bold uppercase tracking-widest group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Boutique
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-6 lg:sticky lg:top-28 h-fit">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-3xl overflow-hidden border border-black/5 shadow-xl shadow-accent/5 relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-primary/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img src={resolveImageUrl(cake.image)} alt={cake.name} className="w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />

                            {/* Floating Badges */}
                            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                <span className="px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-black/5 text-text-main text-[10px] font-bold uppercase tracking-widest">
                                    {cake.category}
                                </span>
                                {cake.countInStock === 0 && (
                                    <span className="px-4 py-1.5 bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                                        Sold Out
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Header Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-accent" />
                                    <span className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold">{cake.brand}</span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-text-main mb-4 leading-[1.1]">{cake.name}</h1>

                                <div className="flex items-center gap-6">
                                    <span className="text-3xl font-serif text-accent">${cake.price.toFixed(2)}</span>
                                    <div className="h-6 w-px bg-black/10" />
                                    <div className="flex items-center gap-1.5 bg-black/[0.03] border border-black/5 px-3 py-1 rounded-full">
                                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                                        <span className="text-sm font-bold text-text-main/90">{cake.rating}</span>
                                        <span className="text-[10px] text-text-muted/70 uppercase tracking-widest ml-1">({cake.numReviews} Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-text-muted/90 leading-relaxed text-lg font-light">
                                {cake.description}
                            </p>

                            {/* Trust Signals */}
                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0">
                                        <Clock className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-main mb-0.5">Freshly Baked</p>
                                        <p className="text-[10px] text-text-muted/80 leading-tight">Prepared within 2 hours of delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0">
                                        <ShieldCheck className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-main mb-0.5">Premium Quality</p>
                                        <p className="text-[10px] text-text-muted/80 leading-tight">Imported Belgian chocolate & pure vanilla</p>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Actions */}
                            <div className="space-y-5 bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                                {cake.countInStock > 0 ? (
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <label className="block text-[10px] font-bold text-text-muted/80 mb-2 uppercase tracking-widest hover:text-text-main transition-colors">Quantity</label>
                                            <div className="relative">
                                                <select
                                                    value={qty}
                                                    onChange={(e) => setQty(Number(e.target.value))}
                                                    className="appearance-none bg-primary border border-black/10 text-text-main text-sm font-bold rounded-xl pl-5 pr-12 py-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all cursor-pointer"
                                                >
                                                    {[...Array(Math.min(cake.countInStock, 10)).keys()].map((x) => (
                                                        <option key={x + 1} value={x + 1} className="bg-white text-text-main">
                                                            {x + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/70">
                                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Subtotal</p>
                                            <p className="text-2xl font-serif text-text-main">${(cake.price * qty).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                                        <p className="text-sm font-bold text-red-500">Restocking Soon</p>
                                        <p className="text-xs text-red-500/70 mt-1">Our chefs are preparing a new batch.</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleAddToCart}
                                    disabled={cake.countInStock === 0}
                                    className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl hover:-translate-y-0.5 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${cake.countInStock === 0
                                        ? 'bg-black/5 text-text-muted/40 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-xl shadow-accent/20'
                                        }`}
                                >
                                    {cake.countInStock === 0 ? 'Currently Unavailable' : 'Add to Atelier Box'}
                                </button>
                            </div>

                            {/* Integrated Add-ons Section */}
                            <div className="pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-accent" />
                                        <h3 className="text-lg font-serif font-bold text-text-main">Complete the Experience</h3>
                                    </div>
                                    <Link to="/add-ons" className="text-[10px] uppercase font-bold text-accent hover:text-text-main transition-colors tracking-widest">
                                        View All
                                    </Link>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
                                    {addOns.map((item) => (
                                        <div key={item.id} className="min-w-[220px] flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <AddOnCard item={item} compact={true} />
                                        </div>
                                    ))}
                                    <Link
                                        to="/add-ons"
                                        className="min-w-[220px] flex-shrink-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-black/10 hover:border-accent/50 hover:bg-accent/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-2 group-hover:bg-accent group-hover:text-white transition-all">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted/70 group-hover:text-text-main transition-colors">More Essentials</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductDetailsPage;

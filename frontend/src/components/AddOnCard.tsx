
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import type { AddOnItem } from '../data/addOns';
import { useCartStore } from '../store/useCartStore';
import { resolveImageUrl } from '../utils/imageUrl';

interface AddOnCardProps {
    item: AddOnItem;
    compact?: boolean;
}

const AddOnCard = ({ item, compact = false }: AddOnCardProps) => {
    const { addToCart, cartItems } = useCartStore();

    // Check if item is already in cart
    const isInCart = cartItems.some(cartItem => cartItem.product === item.id);

    const handleAdd = () => {
        if (!isInCart) {
            addToCart({
                product: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: 1,
            });
        }
    };

    if (compact) {
        return (
            <div className="flex-shrink-0 w-40 bg-white shadow-sm rounded-xl border border-black/5 overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all group">
                <div className="h-28 overflow-hidden relative bg-surface">
                    <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isInCart && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-accent/10 border border-accent/20 text-accent text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3" /> Added
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h4 className="font-bold text-text-main text-sm line-clamp-1 group-hover:text-accent transition-colors" title={item.name}>{item.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                        <span className="font-serif text-accent font-bold text-sm">₹{item.price}</span>
                        <button
                            onClick={handleAdd}
                            disabled={isInCart}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${isInCart ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary border border-black/5 text-text-main hover:bg-accent hover:text-white hover:border-accent'}`}
                        >
                            {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group relative"
        >
            {/* Glowing border effect on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" style={{ border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 0 20px rgba(212,175,55,0.05) inset' }} />

            <div className="h-56 overflow-hidden relative bg-surface rounded-b-xl mx-2 mt-2">
                <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                {/* Light gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />

                <div className="absolute top-3 right-3 z-10">
                    <span className="bg-white/60 text-accent border border-black/5 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {item.category}
                    </span>
                </div>
                {isInCart && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-md transition-all z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-accent to-accent-light text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-accent/20"
                        >
                            <Check className="w-5 h-5" /> In Cart
                        </motion.div>
                    </div>
                )}
            </div>
            <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif font-bold text-xl text-text-main line-clamp-1 group-hover:text-accent transition-colors" title={item.name}>{item.name}</h3>
                    <span className="font-serif text-xl font-bold text-accent">₹{item.price}</span>
                </div>
                <p className="text-text-muted/80 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">{item.description}</p>

                <button
                    onClick={handleAdd}
                    disabled={isInCart}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${isInCart
                        ? 'bg-accent/10 text-accent border border-accent/20 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-accent/30 hover:-translate-y-0.5'
                        }`}
                >
                    {isInCart ? (
                        <>
                            <Check className="w-4 h-4" /> Added to Celebration
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" /> Add to Cart
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default AddOnCard;

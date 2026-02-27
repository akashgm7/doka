import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { resolveImageUrl } from '../utils/imageUrl';

interface CakeCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    sliceImage?: string;
    rating: number;
    brand: string;
}

const CakeCard = ({ id, name, price, image, sliceImage, rating, brand }: CakeCardProps) => {
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const isFav = isFavorite(id);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group rounded-3xl overflow-hidden relative bg-white border border-black/5 shadow-xl shadow-accent/5"
        >
            {/* Glowing border effect on hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 0 20px rgba(212,175,55,0.05) inset' }} />

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(id);
                }}
                className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border backdrop-blur-md
                    ${isFav
                        ? 'bg-red-500/10 text-red-500 scale-110 border-red-500/20'
                        : 'bg-white/60 text-text-muted hover:text-red-500 border-black/5 hover:border-red-500/30'
                    }`}
            >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <Link to={`/product/${id}`} className="block relative overflow-hidden aspect-[4/5] bg-surface mx-2 mt-2 rounded-t-[1.3rem] rounded-b-xl border border-black/[0.03]">
                {/* Main Cake Image */}
                <img
                    src={resolveImageUrl(image)}
                    alt={name}
                    className={`w-full h-full object-cover transition-all duration-700 ${sliceImage
                        ? 'group-hover:opacity-0 group-hover:scale-110'
                        : 'group-hover:scale-110'
                        }`}
                />

                {/* Slice Image (revealed on hover) */}
                {sliceImage && (
                    <img
                        src={resolveImageUrl(sliceImage)}
                        alt={`${name} slice`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700"
                    />
                )}

                {/* Gradient overlays for light blending */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* View Details button */}
                <button
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md border border-accent/20 text-accent px-6 py-2.5 rounded-full text-sm font-bold shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent hover:border-accent hover:text-white z-10"
                >
                    View Details
                </button>
            </Link>

            <div className="px-6 py-5 relative z-10">
                <p className="text-[10px] text-accent uppercase tracking-[0.25em] font-bold mb-2">{brand}</p>
                <Link to={`/product/${id}`}>
                    <h3 className="text-xl font-serif font-bold text-text-main mb-2 group-hover:text-accent transition-colors duration-300 line-clamp-1">{name}</h3>
                </Link>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-serif text-accent">${price.toFixed(2)}</span>
                    <div className="flex items-center gap-1.5 bg-black/[0.03] border border-black/5 px-2.5 py-1.5 rounded-full">
                        <span className="text-accent text-xs">★</span>
                        <span className="text-xs font-bold text-text-main/80">{rating}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CakeCard;

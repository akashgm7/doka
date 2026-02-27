import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CakeCard from '../components/CakeCard';
import api from '../services/api';

interface Cake {
    _id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    brand: string;
    category: string;
}

const ShopPage = () => {
    const [cakes, setCakes] = useState<Cake[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCakes = async () => {
            try {
                const { data } = await api.get('/api/cakes');
                setCakes(data.cakes);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCakes();
    }, []);

    return (
        <div className="pt-24 pb-20 min-h-[80vh] bg-primary relative">
            {/* Ambient effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6 tracking-wide">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light italic pr-2">Collection</span>
                    </h1>
                    <p className="text-text-muted/70 max-w-2xl mx-auto leading-relaxed">Explore our exclusive range of handcrafted cakes.</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent shadow-[0_0_15px_rgba(197,160,40,0.1)]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10 bg-red-50 border border-red-100 rounded-xl backdrop-blur-sm max-w-3xl mx-auto">
                        <p className="font-bold uppercase tracking-widest text-xs mb-2">Error Locating Collection</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {cakes.map((cake) => (
                            <CakeCard
                                key={cake._id}
                                id={cake._id}
                                name={cake.name}
                                price={cake.price}
                                image={cake.image}
                                rating={cake.rating}
                                brand={cake.brand}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopPage;

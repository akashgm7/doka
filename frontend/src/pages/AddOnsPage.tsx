
import { motion } from 'framer-motion';
import { addOns } from '../data/addOns';

import AddOnCard from '../components/AddOnCard';
import { PartyPopper } from 'lucide-react';

const AddOnsPage = () => {
    // Group add-ons by category
    const categories = Array.from(new Set(addOns.map(item => item.category)));

    return (
        <div className="min-h-screen pt-24 pb-20 relative" style={{ background: '#0a0a14' }}>
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #9333ea, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-4 py-2 rounded-full font-bold mb-6 text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    >
                        <PartyPopper className="w-4 h-4" />
                        <span>Complete Your Celebration</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-white mb-6"
                    >
                        Party <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f0d060] italic pr-2">Essentials</span> & Add-ons
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed"
                    >
                        Every detail matters. From bespoke candles to artisanal confetti, we offer everything needed to elevate your occasion.
                    </motion.p>
                </div>

                {categories.map((category, index) => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-16 last:mb-0"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
                                {category}
                            </h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {addOns.filter(item => item.category === category).map((item) => (
                                <AddOnCard key={item.id} item={item} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AddOnsPage;

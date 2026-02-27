import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#FCFBF7' }}>
            {/* Animated background orbs */}
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
                style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-20 blur-[80px]"
                style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center relative z-10"
            >
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex justify-center mb-4"
                >
                    <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                </motion.div>

                <motion.h1
                    initial={{ y: 25, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="text-7xl md:text-9xl font-serif font-bold tracking-[0.3em]"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #f0d060 40%, #D4AF37 80%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    DOKA
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="mt-3 uppercase tracking-[0.5em] text-xs font-medium"
                    style={{ color: 'rgba(212, 175, 55, 0.5)' }}
                >
                    Luxury Cake Delivery
                </motion.p>

                {/* Loading bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-10 w-32 h-0.5 mx-auto overflow-hidden rounded-full"
                    style={{ background: 'rgba(197, 160, 40, 0.1)' }}
                >
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: 'loop' }}
                        className="h-full w-1/2 rounded-full"
                        style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SplashScreen;

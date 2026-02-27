import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-3xl my-6 mx-4 md:mx-8 bg-primary/20">
            {/* Abstract Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px]" />

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-block text-accent font-medium tracking-[0.2em] mb-4 uppercase text-sm"
                >
                    Welcome to DOKA
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 mb-8 leading-tight"
                >
                    Experience the <br />
                    <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-600">Art of Cake</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-light"
                >
                    Impeccably crafted for the connoisseur. Where flavor meets elegance in every slice.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <Link
                        to="/shop"
                        className="inline-block px-10 py-4 border-2 border-accent text-accent font-semibold tracking-wide hover:bg-accent hover:text-white transition-all duration-300 rounded-full"
                    >
                        EXPLORE COLLECTION
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

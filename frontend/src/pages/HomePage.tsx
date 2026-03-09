import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, ShoppingBag,
    Palette, Crown, Award,
    MapPin, Clock, Star
} from 'lucide-react';

const HomePage = () => {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 800], [1, 1.05]);
    const heroY = useTransform(scrollY, [0, 500], [0, 80]);

    return (
        <div className="min-h-screen bg-primary">

            {/* ── 1. CINEMATIC HERO ── */}
            <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
                {/* Background image with parallax */}
                <motion.div
                    style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1920&q=80"
                        alt="DOKA Masterpiece"
                        className="w-full h-full object-cover"
                    />
                    {/* Rich light overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />
                </motion.div>

                {/* Floating orbs */}
                <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/40 backdrop-blur-md border border-accent/40 rounded-full text-accent font-extrabold text-[10px] uppercase tracking-[0.5em] mb-8 shadow-sm">
                            <Sparkles className="w-3 h-3 text-accent" /> Luxury Confections · Est. 2024
                        </span>

                        <div className="text-center mb-10 mt-6 pointer-events-auto select-none">
                            <h1 className="text-6xl md:text-8xl lg:text-[8.5rem] font-serif font-bold text-text-main leading-[0.75] tracking-tighter flex justify-center">
                                {"DOKA".split("").map((letter, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        whileHover={{
                                            y: -8,
                                            scale: 1.05,
                                            rotateX: 10,
                                            rotateY: 5,
                                            transition: { duration: 0.2 }
                                        }}
                                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                        className="inline-block px-1 cursor-default pointer-events-auto"
                                        style={{
                                            perspective: '1000px',
                                            textShadow: `
                                                1px 1px 0px #E5E1D5,
                                                2px 2px 0px #E5E1D5,
                                                3px 3px 0px #E5E1D5,
                                                4px 4px 50px rgba(197, 160, 40, 0.1)
                                            `
                                        }}
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </h1>
                            <motion.span
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="italic font-light block mt-2 text-4xl md:text-6xl lg:text-7xl tracking-[0.05em]"
                                style={{
                                    background: 'linear-gradient(135deg, #C5A028 0%, #D4AF37 40%, #C5A028 80%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.05))'
                                }}
                            >
                                Atelier
                            </motion.span>
                        </div>

                        <p className="text-text-main/90 text-base md:text-lg font-light max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
                            Where haute couture meets fine patisserie. Every creation is a bespoke masterpiece designed for your most cherished moments.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link
                                to="/ready-made"
                                className="group flex items-center gap-3 bg-gradient-to-r from-accent to-accent-light text-white px-10 py-4 rounded-full font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/20 hover:shadow-accent/30"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Shop the Collection
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/make-my-cake"
                                className="group flex items-center gap-3 bg-white border border-accent/20 hover:border-accent/50 px-10 py-4 rounded-full font-bold text-sm tracking-wide shadow-sm transition-all hover:scale-105 text-text-main"
                            >
                                <Palette className="w-4 h-4 text-[#D4AF37]" />
                                Start Your Design
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
                >
                    <span className="text-[#D4AF37] text-[9px] uppercase tracking-[0.6em] font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        Discover
                    </span>
                    <div className="w-[1px] h-10 bg-gradient-to-b from-[#D4AF37] to-transparent" />
                </motion.div>
            </section>

            {/* ── 2. MARQUEE STRIP ── */}
            <div className="overflow-hidden border-y border-black/5 bg-accent/5 py-4 relative">
                <div className="flex gap-0" style={{ animation: 'marquee 20s linear infinite' }}>
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex items-center gap-8 pr-8 whitespace-nowrap flex-shrink-0">
                            {['Artisan Crafted', 'Freshly Baked', 'GPS Tracked Delivery', 'Custom 3D Designs', 'Premium Ingredients', 'Same Day Available'].map((text, i) => (
                                <span key={i} className="flex items-center gap-3 text-accent/70 text-xs uppercase tracking-widest font-semibold">
                                    <Star className="w-3 h-3 fill-accent/20 text-accent/30" />
                                    {text}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 3. THE DOKA EXPERIENCE ── */}
            <section className="py-32 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-[3rem] overflow-hidden aspect-[4/5] group"
                        style={{ boxShadow: '0 40px 80px -20px rgba(197, 160, 40, 0.1), 0 0 0 1px rgba(197, 160, 40, 0.05)' }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            alt="The 3D Process"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                        {/* Floating badge */}
                        <div className="absolute top-6 right-6 bg-white/60 backdrop-blur-xl border border-accent/20 px-4 py-2 rounded-2xl">
                            <span className="text-accent text-xs font-bold uppercase tracking-widest">Innovation</span>
                        </div>
                        <div className="absolute bottom-8 left-8 text-text-main">
                            <h3 className="text-4xl font-serif font-bold">The 3D<br />Canvas</h3>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10 lg:pl-8"
                    >
                        <div>
                            <span className="text-accent text-xs uppercase tracking-[0.4em] font-bold">Our Technology</span>
                            <h2 className="text-5xl md:text-6xl font-serif font-bold text-text-main mt-4 leading-tight">
                                Design Without <br />Limits
                            </h2>
                        </div>
                        <p className="text-text-muted/70 text-lg leading-relaxed">
                            Our industry-first 3D cake builder allows you to visualize every tier, flavor, and decoration in real-time. What you see is exactly what our master bakers will craft.
                        </p>
                        <div className="space-y-5">
                            {[
                                { icon: Award, title: 'Artisan Quality', desc: 'Sourced from the finest ingredients worldwide.' },
                                { icon: Clock, title: 'Freshly Baked', desc: 'Prepared only hours before delivery.' },
                                { icon: MapPin, title: 'GPS Tracked', desc: 'Secure delivery in temperature-controlled units.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-5 p-5 rounded-2xl bg-white border border-black/5 hover:border-accent/20 shadow-sm transition-all hover:bg-surface hover:translate-x-1 group"
                                >
                                    <div className="mt-0.5 w-11 h-11 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                                        <item.icon className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-main">{item.title}</h4>
                                        <p className="text-sm text-text-muted mt-0.5">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <Link to="/make-my-cake" className="inline-flex items-center gap-2 text-[#D4AF37] font-bold group text-sm tracking-wide">
                            Try the 3D Builder
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── 4. STATS STRIP ── */}
            <section className="py-16 px-4 max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-black/5 border border-black/5 rounded-3xl overflow-hidden bg-accent/[0.02]">
                    {[
                        { value: '500+', label: 'Designs Created' },
                        { value: '98%', label: 'Happy Customers' },
                        { value: '2hr', label: 'Avg. Delivery' },
                        { value: '4.9★', label: 'Rating' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="py-10 px-6 text-center"
                        >
                            <p className="text-4xl font-serif font-bold text-accent">{stat.value}</p>
                            <p className="text-text-muted/60 text-[10px] uppercase tracking-widest mt-2 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── 5. LOYALTY PROGRAM ── */}
            <section className="py-8 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[3rem] overflow-hidden p-0.5"
                    style={{ background: 'linear-gradient(135deg, rgba(197, 160, 40, 0.2) 0%, rgba(197, 160, 40, 0.05) 50%, rgba(197, 160, 40, 0.1) 100%)' }}
                >
                    <div className="relative bg-white rounded-[calc(3rem-2px)] overflow-hidden shadow-sm">
                        {/* Background effects */}
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-[#D4AF37]/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/4 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[40%] h-full bg-purple-900/10 blur-[80px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 md:p-16 relative z-10">
                            <div>
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] uppercase font-bold tracking-[0.4em] mb-8">
                                    <Crown className="w-3 h-3" /> Member Privilege
                                </span>
                                <h2 className="text-5xl md:text-6xl font-serif font-bold text-text-main mb-6 leading-tight">
                                    The DOKA <br />Elite Program
                                </h2>
                                <p className="text-text-muted/70 text-lg leading-relaxed mb-10 max-w-md">
                                    Your taste for excellence deserves rewards. Earn 10% back in points on every purchase, and use them as instant credit for your next sweet craving.
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    {[
                                        { val: '10%', label: 'Earning Rate' },
                                        { val: '1pt = ₹1', label: 'Direct Credit' },
                                    ].map((s, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-black/[0.02] border border-black/5">
                                            <h4 className="text-3xl font-bold text-accent">{s.val}</h4>
                                            <p className="text-xs text-text-muted/60 uppercase tracking-widest mt-2">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/profile"
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-accent-light text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-accent/20 hover:scale-105 hover:shadow-2xl hover:shadow-accent/30 transition-all"
                                >
                                    Join DOKA Elite <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="relative">
                                {/* Loyalty Card */}
                                <div
                                    className="relative p-8 rounded-[2rem] overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(197, 160, 40, 0.05) 0%, rgba(197, 160, 40, 0.02) 100%)',
                                        border: '1px solid rgba(197, 160, 40, 0.1)',
                                        boxShadow: '0 30px 60px -20px rgba(197, 160, 40, 0.1)'
                                    }}
                                >
                                    {/* Card shine */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center font-serif italic text-white text-2xl font-bold shadow-lg shadow-accent/20">
                                                D
                                            </div>
                                            <div>
                                                <p className="text-text-main font-bold">Privilege Account</p>
                                                <p className="text-accent/60 text-[10px] uppercase tracking-widest mt-0.5">Active Member</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-accent font-bold text-3xl">450</p>
                                            <p className="text-text-muted/40 text-[10px] uppercase tracking-widest">Points</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-8">
                                        <div className="flex justify-between text-[10px] text-text-muted/60 uppercase tracking-wider mb-2">
                                            <span>Current Tier</span>
                                            <span>Gold · 450/1000</span>
                                        </div>
                                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '45%' }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {['Birthday Double Points', 'Priority Baking Queue', 'Exclusive Design Access'].map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-black/[0.02]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                                <span className="text-text-muted/80 text-sm">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#D4AF37]/10 blur-[60px] -z-10 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── 6. FINAL CTA ── */}
            <section className="py-32 text-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto relative z-10"
                >
                    <div className="inline-flex items-center gap-2 mb-8">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                        ))}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold text-text-main mb-8 leading-tight">
                        Ready for something<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #C5A028 0%, #D4AF37 50%, #C5A028 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            extraordinary?
                        </span>
                    </h2>
                    <p className="text-text-muted/50 mb-14 text-lg max-w-md mx-auto">Browse our signature showcase or design your own bespoke cake today.</p>
                    <Link
                        to="/ready-made"
                        className="inline-flex items-center gap-3 px-14 py-5 bg-gradient-to-r from-accent to-accent-light text-white rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl hover:shadow-accent/30 transition-all shadow-xl shadow-accent/20 active:scale-95"
                    >
                        Explore the Boutique <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </section>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default HomePage;

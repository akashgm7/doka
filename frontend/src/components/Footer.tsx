import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary border-t border-black/5 pt-16 pb-8 relative overflow-hidden">
            {/* Ambient decoration */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.02] blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 group leading-none">
                            <Sparkles className="w-5 h-5 text-accent opacity-80" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-serif font-bold tracking-[0.25em] text-text-main group-hover:text-accent transition-colors">DOKA</span>
                                <span className="text-[8px] tracking-[0.4em] uppercase text-accent/60 font-medium -mt-0.5">Atelier</span>
                            </div>
                        </Link>
                        <p className="text-text-muted/70 text-sm leading-relaxed max-w-xs">
                            Crafting moments of pure joy with our artisanal, luxury cakes.
                            Each creation is a masterpiece designed to elevate your celebrations.
                        </p>
                        <div className="flex gap-3">
                            {['IG', 'FB', 'PT'].map((s, i) => (
                                <button key={i} className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-text-muted/60 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all text-xs font-bold shadow-sm">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-text-main mb-6 text-sm uppercase tracking-widest">Collections</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {['Wedding Cakes', 'Birthday Editions', 'Signature Tarts', 'Gift Sets'].map((item) => (
                                <li key={item}>
                                    <Link to="/ready-made" className="text-text-muted/60 hover:text-accent transition-all hover:translate-x-1 inline-block">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-text-main mb-6 text-sm uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {['Our Story', 'Careers', 'Terms of Service', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-text-muted/60 hover:text-accent transition-all hover:translate-x-1 inline-block">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-text-main mb-6 text-sm uppercase tracking-widest">Newsletter</h4>
                        <p className="text-text-muted/70 text-sm mb-6 leading-relaxed">
                            Subscribe for exclusive collections and luxury offers.
                        </p>
                        <form className="flex flex-col gap-3" onSubmit={e => e.preventDefault()}>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-5 py-3.5 bg-white border border-black/5 rounded-2xl text-sm text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent transition-all shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-5 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-accent to-accent-light transition-all shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-black/5">
                    <p className="text-[10px] text-text-muted/40 uppercase tracking-[0.2em] font-bold">© {new Date().getFullYear()} DOKA Luxury Cakes. All rights reserved.</p>
                    <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <p className="text-[10px] text-text-muted/80 uppercase tracking-widest font-bold italic">Crafted with Pure Passion</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

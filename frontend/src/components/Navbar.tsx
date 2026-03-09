import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const { user, logout } = useAuthStore();
    const { cartItems, resetLocalCart } = useCartStore();
    const location = useLocation();
    const navigate = useNavigate();

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setShowUserMenu(false);
    }, [location]);

    const handleLogout = () => {
        resetLocalCart();
        logout();
        navigate('/');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/ready-made', label: 'Ready Made' },
        { path: '/make-my-cake', label: 'Make My Cake' },
        { path: '/profile?tab=orders', label: 'My Orders' },
    ];

    const isActive = (path: string) => {
        if (path.includes('?')) return location.pathname + location.search === path;
        return location.pathname === path;
    };

    return (
        <nav
            className={`fixed w-full z-50 top-0 start-0 transition-all duration-500 ${scrolled
                ? 'bg-white/90 backdrop-blur-xl shadow-xl shadow-accent/5 border-b border-accent/10'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Sparkles className="w-5 h-5 text-[#D4AF37] opacity-80" />
                        </motion.div>
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-serif font-bold tracking-[0.25em] text-text-main transition-colors duration-300 group-hover:text-accent">
                                DOKA
                            </span>
                            <span className="text-[8px] tracking-[0.4em] uppercase text-accent/60 font-medium -mt-0.5">
                                Atelier
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="relative px-4 py-2 text-sm font-semibold tracking-wide text-text-main hover:text-accent transition-colors group rounded-lg hover:bg-black/5"
                            >
                                {link.label}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="navbar-underline"
                                        className="absolute left-2 right-2 bottom-1 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#f0d060] rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    />
                                )}
                                {!isActive(link.path) && (
                                    <span className="absolute left-2 right-2 bottom-1 h-[2px] bg-[#D4AF37]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full block" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2.5 text-text-main hover:text-accent hover:bg-black/5 rounded-xl transition-all group"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <AnimatePresence>
                                {cartItemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg shadow-[#D4AF37]/40"
                                    >
                                        {cartItemCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* Notification Bell */}
                        <div className="text-text-main hover:text-accent [&>*]:text-text-main group-hover:text-accent transition-colors">
                            <NotificationBell />
                        </div>

                        {/* User Menu (Desktop) */}
                        <div className="hidden md:block relative">
                            {user ? (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowUserMenu(true)}
                                    onMouseLeave={() => setShowUserMenu(false)}
                                >
                                    <button className="flex items-center gap-2 text-text-main font-medium text-sm transition-colors py-2 px-3 rounded-xl hover:bg-black/5 border border-black/5 hover:border-accent/30">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-xs">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name?.split(' ')[0]}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform text-accent/60 ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-accent/5 border border-black/5 overflow-hidden py-2"
                                            >
                                                <div className="px-4 pt-1 pb-3 border-b border-black/5">
                                                    <p className="text-xs text-text-muted uppercase tracking-wider">Signed in as</p>
                                                    <p className="text-sm font-semibold text-text-main mt-0.5 truncate">{user.name}</p>
                                                </div>
                                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text-main hover:bg-black/5 transition-colors">
                                                    <User className="w-4 h-4 text-accent/70" /> My Profile
                                                </Link>
                                                {user.isAdmin && (
                                                    <a
                                                        href={import.meta.env.VITE_ADMIN_URL || `http://${window.location.hostname}:5174`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" /> Admin Dashboard
                                                    </a>
                                                )}
                                                <div className="border-t border-black/5 mt-1 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" /> Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-6 py-2 bg-gradient-to-r from-accent to-accent-light text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-accent/30 hover:scale-105 transition-all active:scale-95"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-text-main font-bold hover:text-accent hover:bg-black/5 rounded-xl transition-colors"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden bg-white/98 backdrop-blur-xl border-t border-black/5 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                >
                                    <Link
                                        to={link.path}
                                        className={`block py-3 px-4 text-base font-medium rounded-xl transition-all ${isActive(link.path)
                                            ? 'text-accent bg-accent/5 border border-accent/10'
                                            : 'text-text-muted hover:text-text-main hover:bg-black/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <div className="pt-4 border-t border-black/10 space-y-1">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-text-main font-semibold text-sm">{user.name}</p>
                                                <p className="text-text-muted text-xs">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:text-text-main hover:bg-black/5 rounded-xl transition-colors">
                                            <User className="w-4 h-4 text-accent/70" /> My Profile
                                        </Link>
                                        {user.isAdmin && (
                                            <a
                                                href={import.meta.env.VITE_ADMIN_URL || `http://${window.location.hostname}:5174`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-2.5 text-accent hover:bg-accent/10 rounded-xl transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4" /> Admin Dashboard
                                            </a>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="block w-full text-center bg-gradient-to-r from-accent to-accent-light text-white font-bold py-3 rounded-xl mx-4"
                                        style={{ width: 'calc(100% - 2rem)' }}
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

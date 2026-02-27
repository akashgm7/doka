import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { setCredentials, user } = useAuthStore();
    const { fetchFavorites, clearFavorites } = useFavoritesStore();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) navigate(redirect);
    }, [navigate, user, redirect]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/users/login', { email, password });
            setCredentials(data);

            const currentCart = useCartStore.getState().cartItems;
            if (currentCart.length > 0) {
                // Merge guest cart with backend cart
                const { data: syncData } = await api.put('/api/users/cart', { cartItems: currentCart }, { headers: { Authorization: `Bearer ${data.token}` } });
                if (syncData.cart) {
                    useCartStore.getState().setCart(syncData.cart);
                }
            } else if (data.cart && data.cart.length > 0) {
                // Restore from backend if guest cart was empty
                useCartStore.getState().setCart(data.cart);
            }

            clearFavorites();
            await fetchFavorites();
            navigate(redirect);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
            {/* Background effects */}
            <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(197,160,40,0.12)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(212,175,55,0.08)' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-white border border-accent/20 shadow-sm">
                        <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-text-main mb-2">Welcome Back</h1>
                    <p className="text-text-muted/60 text-sm">Sign in to your DOKA account</p>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 p-4 rounded-2xl text-sm text-red-500 text-center bg-red-50 border border-red-100 shadow-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Form Card */}
                <div className="p-8 rounded-3xl space-y-5 bg-white border border-black/5 shadow-[0_20px_50px_rgba(197,160,40,0.1)]">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted/60 mb-2.5 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-black/10 text-text-main placeholder-text-muted/30 text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2.5">
                            <label className="text-xs font-semibold text-text-muted/60 uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" university-bold className="text-xs font-semibold text-accent/80 hover:text-accent transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-black/10 text-text-main placeholder-text-muted/30 text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            onClick={submitHandler}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-text-muted/60">
                    New to DOKA?{' '}
                    <Link
                        to={redirect ? `/register?redirect=${redirect}` : '/register'}
                        className="text-accent font-bold hover:text-accent-light transition-colors"
                    >
                        Create an Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;

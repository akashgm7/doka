import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import api from '../services/api';
import { Sparkles, User, Mail, Lock } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, setCredentials } = useAuthStore();

    const redirectPath = location.search ? location.search.split('=')[1] : '/';
    const redirect = `/onboarding?next=${encodeURIComponent(redirectPath)}`;

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }
    }, [navigate, user, redirect]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/users/register', { name, email, password });
            setCredentials(data);

            const currentCart = useCartStore.getState().cartItems;
            if (currentCart.length > 0) {
                // Save any items added before registering (Merge with backend)
                const { data: syncData } = await api.put('/api/users/cart', { cartItems: currentCart }, { headers: { Authorization: `Bearer ${data.token}` } });
                if (syncData.cart) {
                    useCartStore.getState().setCart(syncData.cart);
                }
            } else if (data.cart && data.cart.length > 0) {
                // Restore from backend if guest cart was empty
                useCartStore.getState().setCart(data.cart);
            }

            navigate(redirect);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative px-4 bg-primary">
            {/* Ambient background effect */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4 bg-white border border-accent/20 w-12 h-12 rounded-2xl shadow-sm">
                        <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-text-main mb-2">Join the Atelier</h1>
                    <p className="text-text-muted/60 text-sm">Create an account for exclusive access and privileges</p>
                </div>

                <form onSubmit={submitHandler} className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(197,160,40,0.1)] space-y-6 border border-black/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-xl text-center text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-text-muted/60 mb-1 uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-5 h-5 opacity-70 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/30 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/30 font-medium"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-text-muted/60 mb-1 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-5 h-5 opacity-70 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/30 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/30 font-medium"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-text-muted/60 mb-1 uppercase tracking-widest pl-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-5 h-5 opacity-70 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/30 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/30 font-medium"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-text-muted/60 mb-1 uppercase tracking-widest pl-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-5 h-5 opacity-70 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/30 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/30 font-medium"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-xl shadow-accent/20 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Processing...' : 'Become a Member'}
                    </button>

                    <p className="text-center text-xs text-text-muted/60 pt-2">
                        By joining, you agree to our Terms of Service.
                    </p>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted/60">
                    Already an esteemed member?{' '}
                    <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-accent font-bold hover:text-accent-light transition-colors uppercase tracking-wider text-xs ml-1">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

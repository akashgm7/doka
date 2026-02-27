import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/api/users/forgotpassword', { email });
            setMessage('A password reset link has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 relative bg-primary">
            {/* Ambient effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(197,160,40,0.1)] border border-black/5 relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-accent/5 blur-[50px] pointer-events-none" />

                    <h1 className="text-3xl font-serif font-bold text-text-main mb-6 text-center">Reset Password</h1>

                    {message && <div className="bg-accent/10 text-accent p-4 rounded-xl mb-6 text-center border border-accent/30 text-sm font-bold shadow-sm">{message}</div>}
                    {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center border border-red-100 text-sm">{error}</div>}

                    {!message && (
                        <form onSubmit={submitHandler} className="space-y-6">
                            <p className="text-sm text-text-muted/60 text-center leading-relaxed">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted/60 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-main transition-all placeholder:text-text-muted/30"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl font-bold hover:shadow-xl shadow-accent/20 transition-all uppercase tracking-widest text-sm disabled:opacity-70 mt-4"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-xs text-text-muted/60 border-t border-black/5 pt-6">
                        Wait, I remember my password!{' '}
                        <Link to="/login" className="text-accent font-bold hover:text-accent-light transition-colors uppercase tracking-widest ml-1">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

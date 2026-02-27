import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailPage = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const { token } = useParams();

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await api.get(`/api/users/verifyemail/${token}`);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 relative bg-primary text-center">
            {/* Ambient effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(197,160,40,0.1)] border border-black/5 relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-accent/5 blur-[50px] pointer-events-none" />

                    {status === 'loading' && (
                        <div className="space-y-6 relative z-10 py-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto shadow-[0_0_15px_rgba(197,160,40,0.1)]"></div>
                            <h2 className="text-2xl font-serif font-bold text-text-main tracking-wide">Verifying Masterpiece...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 relative z-10 py-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
                                <span className="text-white text-4xl font-bold">✓</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-text-main tracking-wide mt-6">Email Verified!</h2>
                            <p className="text-text-muted/60 text-sm leading-relaxed max-w-[250px] mx-auto">{message}</p>
                            <div className="pt-4">
                                <Link
                                    to="/login"
                                    className="inline-block bg-gradient-to-r from-accent to-accent-light text-white px-10 py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(197,160,40,0.4)] transition-all uppercase tracking-widest text-sm"
                                >
                                    Enter Boutique
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 relative z-10 py-4">
                            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <span className="text-red-500 text-4xl font-bold pl-0.5">✕</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-text-main tracking-wide mt-6">Verification Failed</h2>
                            <p className="text-text-muted/60 text-sm leading-relaxed max-w-[250px] mx-auto">{message}</p>
                            <div className="pt-4">
                                <Link
                                    to="/register"
                                    className="inline-block bg-white border border-black/5 text-text-main px-8 py-3.5 rounded-xl font-bold hover:bg-surface transition-all uppercase tracking-widest text-sm"
                                >
                                    Try Registering Again
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;

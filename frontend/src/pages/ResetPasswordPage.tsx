import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/api/users/resetpassword/${token}`, { password });
            alert('Password reset successful! You can now log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
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

                    <h1 className="text-3xl font-serif font-bold text-text-main mb-8 text-center relative z-10">Create New Password</h1>

                    {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-center border border-red-100 text-sm">{error}</div>}

                    <form onSubmit={submitHandler} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted/60 mb-2">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-main transition-all placeholder:text-text-muted/30"
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted/60 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-main transition-all placeholder:text-text-muted/30"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl font-bold hover:shadow-xl shadow-accent/20 transition-all uppercase tracking-widest text-sm disabled:opacity-70 mt-4"
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

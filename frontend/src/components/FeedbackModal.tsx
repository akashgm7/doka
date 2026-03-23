import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';

interface FeedbackModalProps {
    order: any;
    onClose: () => void;
    onSubmitted: (updatedOrder: any) => void;
}

const FeedbackModal = ({ order, onClose, onSubmitted }: FeedbackModalProps) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating before submitting.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post(`/api/orders/${order._id || order.id}/feedback`, { rating, comment });
            onSubmitted(data);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    const displayed = hovered || rating;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-gray-900">How was it? ✨</h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                                    Order #{String(order._id).slice(-8)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all duration-150 ${star <= displayed
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-200 fill-gray-200'
                                            }`}
                                    />
                                </motion.button>
                            ))}
                        </div>

                        {/* Star label */}
                        <div className="text-center mb-6 h-5">
                            {displayed > 0 && (
                                <motion.span
                                    key={displayed}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm font-bold text-amber-500 uppercase tracking-widest"
                                >
                                    {labels[displayed]}
                                </motion.span>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Tell us more (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Loved the presentation, the cream was perfect..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none transition-all"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Feedback
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default FeedbackModal;

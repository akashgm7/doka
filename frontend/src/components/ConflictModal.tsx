import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

interface ConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmClear: () => void;
}

const ConflictModal = ({ isOpen, onClose, onConfirmClear }: ConflictModalProps) => {
    const { orderType } = useCartStore();

    if (!isOpen) return null;

    const existingType = orderType === 'MMC' ? 'Make My Cake (Custom)' : 'Ready-made';
    const newType = existingType === 'Make My Cake (Custom)' ? 'Ready-made' : 'Make My Cake (Custom)';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-text-muted/40 hover:text-text-main transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-text-main mb-3">Order Conflict</h3>

                        <p className="text-sm text-text-muted/80 leading-relaxed max-w-[90%] mb-8">
                            Your cart currently has <strong>{existingType}</strong> items. You cannot mix them with <strong>{newType}</strong> items.
                            <br /><br />
                            Would you like to clear your cart to add this new item?
                        </p>

                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={onConfirmClear}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-accent/20 transition-all hover:-translate-y-0.5"
                            >
                                <Trash2 className="w-4 h-4" /> Clear Cart & Add New Item
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-text-muted/60 hover:bg-black/5 hover:text-text-main transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConflictModal;

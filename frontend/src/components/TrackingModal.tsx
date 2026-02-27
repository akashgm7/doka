import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChefHat, Truck, Home, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';

interface TrackingModalProps {
    order: any;
    onClose: () => void;
    onDelivered?: () => void;
}

const TrackingModal = ({ order, onClose, onDelivered }: TrackingModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [deliveryMarked, setDeliveryMarked] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const steps = [
        { icon: Package, label: 'Order Confirmed', time: 'Just now' },
        { icon: ChefHat, label: 'Baking in Progress', time: '~15 mins' },
        { icon: Check, label: 'Quality Check', time: '~30 mins' },
        { icon: Truck, label: 'Out for Delivery', time: '~45 mins' },
        { icon: Home, label: 'Delivered', time: '~60 mins' },
    ];

    const totalSteps = steps.length; // 5

    // Mark as delivered in the database
    const markDelivered = async () => {
        if (deliveryMarked) return;
        setDeliveryMarked(true);
        try {
            console.log('[TrackingModal] Calling PUT /api/orders/' + order._id + '/deliver');
            const res = await api.put('/api/orders/' + order._id + '/deliver');
            console.log('[TrackingModal] Success! DB updated:', res.data?.status, res.data?.isDelivered);
            // Auto-close and refresh after 2 seconds
            setTimeout(() => {
                if (onDelivered) {
                    onDelivered();
                }
            }, 2000);
        } catch (err: any) {
            console.error('[TrackingModal] API Error:', err?.response?.status, err?.response?.data, err?.message);
        }
    };

    useEffect(() => {
        // If already delivered, jump to end immediately
        if (order.status === 'Delivered' || order.isDelivered) {
            if (currentStep !== totalSteps - 1) {
                setCurrentStep(totalSteps - 1);
            }
            setDeliveryMarked(true); // don't re-send
            return;
        }

        // Simulate progression: advance one step every 5 seconds
        intervalRef.current = setInterval(() => {
            setCurrentStep(prev => {
                const next = prev + 1;
                if (next >= totalSteps) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return totalSteps - 1;
                }
                return next;
            });
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [order, totalSteps, currentStep]);

    // When the last step is reached, update the DB
    useEffect(() => {
        if (currentStep === totalSteps - 1 && !deliveryMarked && !(order.status === 'Delivered' || order.isDelivered)) {
            markDelivered();
        }
    }, [currentStep, totalSteps, deliveryMarked, order.status, order.isDelivered]);

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white border border-black/[0.03] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12)] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none -mr-32 -mt-32" />

                    <div className="p-10 relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    <h3 className="text-xl font-serif font-bold text-text-main">Live Tracking</h3>
                                </div>
                                <p className="text-text-muted/40 text-[10px] font-mono tracking-widest uppercase">Order Ref <span className="text-text-main font-bold">#{order._id.substring(order._id.length - 8)}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 bg-primary hover:bg-white hover:shadow-lg rounded-2xl transition-all text-text-muted/40 hover:text-text-main border border-black/[0.03]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative px-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-black/[0.03]" />

                            {/* Progress Fill */}
                            <motion.div
                                className="absolute left-[27px] top-6 w-[2px] bg-accent"
                                initial={{ height: 0 }}
                                animate={{ height: `${(currentStep / (totalSteps - 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />

                            <div className="space-y-12 relative">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index <= currentStep;
                                    const isCompleted = index < currentStep;

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-8 relative group"
                                        >
                                            <div className={`
                                                relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border shadow-sm
                                                ${isActive ? 'bg-text-main text-white border-transparent' : 'bg-white text-text-muted/20 border-black/[0.03] group-hover:border-black/5'}
                                            `}>
                                                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-700`} />
                                                {isCompleted && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <div className={`flex-1 pt-1.5 transition-all duration-700 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
                                                <h4 className={`font-bold font-serif text-lg ${isActive ? 'text-text-main' : 'text-text-muted/40'}`}>{step.label}</h4>
                                                <p className="text-[10px] text-accent font-bold mt-1 uppercase tracking-widest">{step.time}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {currentStep === totalSteps - 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 p-8 bg-accent/5 border border-accent/10 rounded-3xl text-center relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
                                <p className="text-text-main font-bold font-serif text-xl mb-2">🎉 Masterpiece Delivered!</p>
                                <p className="text-[10px] text-text-muted/40 uppercase tracking-[0.2em] font-bold">Your Artisanal Experience Awaits</p>
                            </motion.div>
                        )}

                        <div className="mt-12 pt-10 border-t border-black/[0.03] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary border border-black/[0.03] flex items-center justify-center shadow-inner">
                                    <Truck className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] font-bold mb-0.5">Delivery Specialist</p>
                                    <p className="font-bold text-text-main tracking-widest text-xs">DOKA CONCIERGE</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.2em] font-bold mb-0.5">Courier Status</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="font-bold text-text-main tracking-widest text-[10px] uppercase">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default TrackingModal;

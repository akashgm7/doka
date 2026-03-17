import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, RotateCcw, ShoppingBag, Sparkles,
    Truck
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { STEP_CONFIG, STEP_KEYS, OPTIONS, BASE_PRICE, DELIVERY_FEE } from '../data/cakeOptions';
import CakePreview3D from '../components/CakePreview3D';
import ConflictModal from '../components/ConflictModal';

// ── Shape SVGs for the selector cards ──
const SHAPE_SVGS: Record<string, React.ReactNode> = {
    circle: (
        <svg viewBox="0 0 80 80" className="w-12 h-12">
            <circle cx="40" cy="40" r="36" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    square: (
        <svg viewBox="0 0 80 80" className="w-12 h-12">
            <rect x="8" y="8" width="64" height="64" rx="4" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    rectangle: (
        <svg viewBox="0 0 100 70" className="w-14 h-10">
            <rect x="6" y="6" width="88" height="58" rx="4" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    triangle: (
        <svg viewBox="0 0 80 80" className="w-12 h-12">
            <polygon points="40,10 70,70 10,70" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
};

const MakeMyCakePage = () => {
    const navigate = useNavigate();
    const addToCart = useCartStore((state) => state.addToCart);
    const progressRef = useRef<HTMLDivElement>(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({
        Base: 'circle',
        Flavour: 'vanilla',
        Design: 'classic',
        Size: 'small',
    });
    const [cakeMessage, setCakeMessage] = useState('');
    const [message] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const selectionPrice = useMemo(() => {
        return ['Base', 'Flavour', 'Design', 'Size'].reduce((total, step) => {
            const selected = OPTIONS[step]?.find((o) => o.id === selections[step]);
            return total + (selected?.price || 0);
        }, BASE_PRICE);
    }, [selections]);

    const totalPrice = selectionPrice + DELIVERY_FEE;

    const cakeSummary = useMemo(() => {
        return ['Base', 'Flavour', 'Design', 'Size'].map((step) => {
            const selected = OPTIONS[step]?.find((o) => o.id === selections[step]);
            return { step, label: selected?.label || '', price: selected?.price || 0, image: selected?.image || '' };
        });
    }, [selections]);

    const handleSelect = (step: string, id: string) => {
        setSelections((prev) => ({ ...prev, [step]: id }));
    };

    const goToStep = (i: number) => {
        setCurrentStep(i);
        // Only scroll the progress bar container horizontally, don't affect the whole page grid/scroll
        const container = progressRef.current;
        const target = container?.children[i] as HTMLElement;
        if (container && target) {
            const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    const handleNext = () => { if (currentStep < STEP_KEYS.length - 1) goToStep(currentStep + 1); };
    const handleBack = () => { if (currentStep > 0) goToStep(currentStep - 1); };
    const handleReset = () => {
        setSelections({ Base: 'circle', Flavour: 'vanilla', Design: 'classic', Size: 'small' });
        setCakeMessage('');
        goToStep(0);
    };

    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<any>(null);

    const onOpenCart = () => {
        navigate('/cart');
    };

    const handleAddToCart = () => {
        if (isAdding) return;
        setIsAdding(true);

        const shapeName = cakeSummary.find(s => s.step === 'Base')?.label || 'Round';
        const designName = cakeSummary.find(s => s.step === 'Design')?.label || '';
        const customName = `Custom ${shapeName} Cake — ${designName}`;

        const stableId = `mmc-${selections.Base}-${selections.Flavour}-${selections.Design}-${selections.Size}-${cakeMessage.replace(/\s+/g, '-').toLowerCase()}`;

        const item = {
            product: stableId,
            name: customName,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
            price: selectionPrice,
            qty: 1,
            isMMC: true,
            customization: {
                shape: selections.Base,
                flavour: selections.Flavour,
                design: selections.Design,
                size: selections.Size,
                message: cakeMessage
            }
        };

        const result = addToCart(item);

        if (!result.success) {
            setPendingItem(item);
            setConflictModalOpen(true);
            setIsAdding(false);
            return;
        }

        setTimeout(() => {
            setIsAdding(false);
            onOpenCart();
        }, 1500);
    };

    const handleConfirmClear = () => {
        if (pendingItem) {
            useCartStore.getState().clearCart();
            addToCart(pendingItem);
            setConflictModalOpen(false);
            setPendingItem(null);
            onOpenCart();
        }
    };

    const stepConfig = STEP_CONFIG[currentStep];
    const stepKey = stepConfig.key;
    const isOptionStep = ['Base', 'Flavour', 'Design', 'Size'].includes(stepKey);
    const isTextStep = stepKey === 'Text';
    const isReviewStep = stepKey === 'Review';
    const isBaseStep = stepKey === 'Base';

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-primary">
            {/* Ambient effects */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />
            <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-black/5 pb-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="inline-flex items-center gap-2 text-accent uppercase tracking-[0.3em] text-[10px] font-bold">
                            <Sparkles className="w-3.5 h-3.5" /> Atelier Custom Creation
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main mt-2">Make My Cake</h1>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-start md:items-end gap-3">
                        <p className="text-text-muted/70 text-xs max-w-xs md:text-right leading-relaxed">
                            Design your masterpiece. Custom orders are crafted fresh and are exclusively available for <strong className="text-accent">delivery</strong>.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/5 text-accent rounded-xl text-[10px] uppercase font-bold border border-accent/20 shadow-sm">
                            <Truck className="w-3 h-3" /> ${DELIVERY_FEE} Delivery Fee Included
                        </div>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
                    <div ref={progressRef} className="flex items-center gap-2 min-w-max mx-auto justify-center pb-2">
                        {STEP_CONFIG.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = i === currentStep;
                            const isDone = i < currentStep;
                            return (
                                <div key={step.key} className="flex items-center">
                                    <button
                                        onClick={() => goToStep(i)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border backdrop-blur-md ${isActive ? 'bg-gradient-to-r from-accent to-accent-light text-white border-transparent shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105'
                                            : isDone ? 'bg-white text-text-main border-black/5 shadow-sm'
                                                : 'bg-white/40 text-text-muted/70 border-black/5'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/10' : isDone ? 'bg-accent/10' : 'bg-transparent'
                                            }`}>
                                            {isDone ? <span className="text-accent text-[10px] font-bold">✓</span> : <Icon className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="text-[10px] font-bold whitespace-nowrap uppercase tracking-wider">{step.label}</span>
                                    </button>
                                    {i < STEP_CONFIG.length - 1 && (
                                        <div className={`w-6 h-[2px] mx-1 rounded-full ${isDone ? 'bg-accent/40' : 'bg-black/5'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Builder Panel */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            <motion.div key={stepKey} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                                className="bg-white rounded-3xl border border-black/5 p-8 shadow-xl shadow-accent/5 relative overflow-hidden"
                            >
                                {/* Soft glow accent in panel */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-50" />

                                <h2 className="text-2xl font-serif font-bold text-text-main mb-1.5">{stepConfig.desc}</h2>
                                <p className="text-xs text-accent uppercase tracking-[0.2em] font-bold mb-8">Step {currentStep + 1} of {STEP_KEYS.length}</p>

                                {/* Base / Shape Step */}
                                {isBaseStep && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {OPTIONS.Base.map((opt) => {
                                            const isSelected = selections.Base === opt.id;
                                            return (
                                                <button key={opt.id} onClick={() => handleSelect('Base', opt.id)}
                                                    className={`relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${isSelected ? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(212,175,55,0.15)] scale-[1.02]' : 'border-black/5 bg-primary hover:border-accent/30 hover:bg-white hover:-translate-y-1'
                                                        }`}
                                                >
                                                    <div className={`mb-4 transition-colors ${isSelected ? 'text-accent' : 'text-text-muted/70'}`}>
                                                        {SHAPE_SVGS[opt.id]}
                                                    </div>
                                                    <h4 className="font-bold text-sm text-text-main mb-1">{opt.label}</h4>
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted/70">{opt.price === 0 ? 'Included' : `+$${opt.price}`}</p>
                                                    {isSelected && (
                                                        <motion.div layoutId="shape-badge-light" className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                                            <span className="text-white text-[10px] font-bold">✓</span>
                                                        </motion.div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Option Grid (Flavour, Design, Size) */}
                                {isOptionStep && !isBaseStep && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {OPTIONS[stepKey]?.map((opt) => (
                                            <button key={opt.id} onClick={() => handleSelect(stepKey, opt.id)}
                                                className={`relative p-5 rounded-2xl border text-left transition-all duration-300 group ${selections[stepKey] === opt.id ? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-black/5 bg-primary hover:border-accent/30 hover:bg-white hover:-translate-y-1'
                                                    }`}
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border border-black/5 bg-white shadow-sm">
                                                    {opt.image}
                                                </div>
                                                <h4 className="font-bold text-sm text-text-main mb-1">{opt.label}</h4>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted/70">{opt.price === 0 ? 'Included' : `+$${opt.price}`}</p>
                                                {selections[stepKey] === opt.id && (
                                                    <motion.div layoutId="selected-badge-light" className="absolute top-4 right-4 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                                        <span className="text-white text-[10px] font-bold">✓</span>
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Text Input Step */}
                                {isTextStep && (
                                    <div className="max-w-xl">
                                        <label className="block text-xs font-bold text-text-muted/80 mb-3 uppercase tracking-widest">
                                            Cake Message <span className="text-text-muted/60 font-normal ml-2">(optional)</span>
                                        </label>
                                        <textarea value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value.slice(0, 80))}
                                            placeholder="Write your dedication here..." rows={4}
                                            className="w-full px-5 py-4 bg-primary border border-black/5 rounded-2xl text-sm text-text-main focus:ring-1 focus:ring-accent focus:border-accent transition-all shadow-sm resize-none placeholder:text-text-muted/20"
                                        />
                                        <div className="flex items-center justify-between mt-3 px-1">
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted/60">Maximum 80 letters</p>
                                            <p className={`text-[10px] font-bold ${cakeMessage.length > 70 ? 'text-red-500' : 'text-accent'}`}>{cakeMessage.length}/80</p>
                                        </div>

                                        {/* Stylized Preview */}
                                        <div className="mt-8 p-6 bg-primary rounded-2xl border border-black/5 relative overflow-hidden shadow-sm">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Sparkles className="w-20 h-20 text-accent" />
                                            </div>
                                            <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold mb-4">Engraving Preview</p>
                                            <p className="font-serif text-2xl text-text-main/90 italic min-h-[3rem] leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                                {cakeMessage || <span className="text-text-muted/50 not-italic font-sans text-sm tracking-widest uppercase">Your message will appear here...</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Review Step */}
                                {isReviewStep && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            {cakeSummary.map((s) => {
                                                return (
                                                    <div key={s.step} className="p-4 bg-primary rounded-2xl border border-black/5 flex items-center gap-4 shadow-sm">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white border border-black/5 shadow-sm">
                                                            {s.image}
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-text-muted/70 uppercase tracking-[0.2em] font-bold mb-0.5">{s.step === 'Base' ? 'Shape' : s.step}</p>
                                                            <p className="font-bold text-sm text-text-main">{s.label}</p>
                                                            <p className="text-[10px] text-accent font-bold mt-1">{s.price === 0 ? 'Included' : `+$${s.price}`}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {cakeMessage && (
                                            <div className="p-5 bg-accent/5 rounded-2xl border border-accent/10">
                                                <p className="text-[9px] text-accent uppercase tracking-[0.2em] font-bold mb-2">Message</p>
                                                <p className="font-serif text-lg text-text-main">"{cakeMessage}"</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 p-5 bg-accent/5 rounded-2xl border border-accent/10 shadow-sm">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-black/5 shadow-sm">
                                                <Truck className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main mb-1">Exclusive Delivery</p>
                                                <p className="text-[11px] text-text-muted/80 leading-relaxed">Custom masterpieces are carefully transported directly to your location. Freshness guaranteed. Fee: ${DELIVERY_FEE}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Panel */}
                        <div className="flex items-center justify-between mt-8 px-2">
                            <button onClick={handleBack} disabled={currentStep === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-text-muted/70 hover:text-text-main hover:bg-black/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-text-muted/60 hover:text-red-500 transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" /> Start Over
                            </button>
                            {isReviewStep ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-accent/20 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed ${isAdding ? 'opacity-70 bg-accent/70' : 'bg-gradient-to-r from-accent to-accent-light'}`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    {isAdding ? 'Preparing Order...' : `Confirm Order — $${totalPrice}`}
                                </button>
                            ) : (
                                <button onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 transition-all hover:scale-[1.02]">
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Live Preview Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xl shadow-accent/5 sticky top-28 flex flex-col h-auto overflow-hidden">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                            <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                                <h3 className="text-xl font-serif font-bold text-text-main">Your Masterpiece</h3>
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                                </div>
                            </div>

                            {/* 3D View Screen */}
                            <div className="w-full h-[600px] mb-6 rounded-2xl overflow-hidden bg-primary border border-black/5 relative">
                                <CakePreview3D shape={selections.Base} flavour={selections.Flavour} design={selections.Design} size={selections.Size} cakeMessage={cakeMessage} />
                            </div>

                            {/* Selected Items Mini-Summary */}
                            <div className="space-y-3 flex-1 mb-6">
                                {cakeSummary.map((s) => (
                                    <div key={s.step} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-sm border border-black/5 shadow-sm group-hover:border-accent/30 transition-colors">{s.image}</span>
                                            <div>
                                                <p className="text-[9px] text-text-muted/70 uppercase tracking-[0.2em] font-bold">{s.step === 'Base' ? 'Shape' : s.step}</p>
                                                <p className="font-bold text-text-main text-xs">{s.label}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-accent font-bold">{s.price === 0 ? '—' : `+$${s.price}`}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Final Pricing */}
                            <div className="pt-5 border-t border-black/5">
                                <div className="flex items-center justify-between text-xs text-text-muted/70 mb-2 font-medium"><span>Cake Base</span><span className="text-text-main font-bold">${selectionPrice}</span></div>
                                <div className="flex items-center justify-between text-xs text-text-muted/70 mb-4 font-medium">
                                    <span className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-accent" /> Specialized Delivery</span><span className="text-text-main font-bold">${DELIVERY_FEE}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted/80">Total Cost</span>
                                    <span className="text-2xl font-serif font-bold text-accent">${totalPrice}</span>
                                </div>
                            </div>

                            {/* System Status Message */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="mt-5 p-3.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold text-center border border-green-100 shadow-sm">
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conflict Modal */}
            <ConflictModal
                isOpen={conflictModalOpen}
                onClose={() => {
                    setConflictModalOpen(false);
                    setPendingItem(null);
                }}
                onConfirmClear={handleConfirmClear}
            />
        </div>
    );
};

export default MakeMyCakePage;

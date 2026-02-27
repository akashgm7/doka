
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
}

const MouseGlow = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isTouch, setIsTouch] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const particleId = useRef(0);

    const addParticle = useCallback((x: number, y: number) => {
        const id = particleId.current++;
        const size = Math.random() * 4 + 2;
        const colors = ['#C5A028', '#D4AF37', '#967B1B', '#FAD961'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        setParticles((prev) => [...prev.slice(-20), { id, x, y, size, color }]);

        // Remove particle after animation
        setTimeout(() => {
            setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 1000);
    }, []);

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
        if (isTouch) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dist = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);

            // Only add particles if moving fast enough to create a trail
            if (dist > 15) {
                addParticle(e.clientX, e.clientY);
                lastPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [addParticle, isTouch]);

    if (isTouch) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ opacity: 0, scale: 0, x: particle.x, y: particle.y }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0, 1.2, 0.5],
                            y: particle.y - 40, // Rise slightly
                            x: particle.x + (Math.random() - 0.5) * 30 // Drifts sideways
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 10px ${particle.color}`,
                            left: 0,
                            top: 0,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Very faint, tiny localized glow just for the cursor tip */}
            <MousePointerGlow />
        </div>
    );
};

const MousePointerGlow = () => {
    const [pos, setPos] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div
            className="absolute w-4 h-4 rounded-full opacity-20 blur-[4px]"
            style={{
                left: pos.x,
                top: pos.y,
                background: '#D4AF37',
                transform: 'translate(-50%, -50%)',
                transition: 'transform 0.1s ease-out'
            }}
        />
    );
};

export default MouseGlow;

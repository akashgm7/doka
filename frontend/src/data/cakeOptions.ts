import {
    Cake, Droplets, Palette, Type, Ruler, ClipboardCheck
} from 'lucide-react';
import React from 'react';

// ── Step Definitions ──
export const STEP_CONFIG = [
    { key: 'Base', label: 'Shape', icon: Cake, desc: 'Choose your cake shape' },
    { key: 'Flavour', label: 'Flavour', icon: Droplets, desc: 'Pick a flavour profile' },
    { key: 'Design', label: 'Design', icon: Palette, desc: 'Select a design style' },
    { key: 'Text', label: 'Message', icon: Type, desc: 'Add a personal message' },
    { key: 'Size', label: 'Size', icon: Ruler, desc: 'Choose the right size' },
    { key: 'Review', label: 'Review', icon: ClipboardCheck, desc: 'Confirm your creation' },
] as const;

export const STEP_KEYS = STEP_CONFIG.map(s => s.key);

// ── Options Data ──
export const OPTIONS: Record<string, { id: string; label: string; price: number; color: string; image: string }[]> = {
    Base: [
        { id: 'circle', label: 'Round', price: 0, color: '#FFB6C1', image: '⭕' },
        { id: 'square', label: 'Square', price: 4, color: '#90CAF9', image: '🔲' },
        { id: 'rectangle', label: 'Rectangle', price: 6, color: '#CE93D8', image: '▬' },
        { id: 'triangle', label: 'Triangle', price: 8, color: '#F48FB1', image: '🔺' },
    ],
    Flavour: [
        { id: 'vanilla', label: 'Vanilla', price: 0, color: '#FFF3CD', image: '🍦' },
        { id: 'strawberry', label: 'Strawberry', price: 3, color: '#FFB6C1', image: '🍓' },
        { id: 'chocolate', label: 'Chocolate', price: 5, color: '#5C4033', image: '🍫' },
        { id: 'mango', label: 'Mango', price: 4, color: '#FFD54F', image: '🥭' },
        { id: 'coffee', label: 'Coffee', price: 3, color: '#795548', image: '☕' },
        { id: 'pistachio', label: 'Pistachio', price: 6, color: '#A5D6A7', image: '🟢' },
        { id: 'redvelvet', label: 'Red Velvet', price: 8, color: '#C0392B', image: '🔴' },
    ],
    Design: [
        { id: 'classic', label: 'Classic Smooth', price: 0, color: '#FAFAFA', image: '⬜' },
        { id: 'rustic', label: 'Rustic Naked', price: 3, color: '#D7CCC8', image: '🪵' },
        { id: 'floral', label: 'Floral Garden', price: 10, color: '#F8BBD0', image: '🌸' },
        { id: 'drip', label: 'Chocolate Drip', price: 6, color: '#4E342E', image: '🍫' },
        { id: 'ombre', label: 'Ombré Gradient', price: 8, color: '#CE93D8', image: '🎨' },
        { id: 'geometric', label: 'Geometric Art', price: 12, color: '#90CAF9', image: '🔷' },
        { id: 'marble', label: 'Marble Luxury', price: 14, color: '#CFD8DC', image: '🤍' },
        { id: 'gold-accent', label: 'Gold Accent', price: 16, color: '#FFD700', image: '✨' },
    ],
    Size: [
        { id: 'small', label: '0.5 Kg (serves 6-8)', price: 0, color: '#E3F2FD', image: '🎂' },
        { id: 'medium', label: '1 Kg (serves 10-12)', price: 15, color: '#BBDEFB', image: '🎂' },
        { id: 'large', label: '2 Kg (serves 14-18)', price: 30, color: '#90CAF9', image: '🎂' },
        { id: 'tiered', label: '3 Kg (serves 25+)', price: 55, color: '#64B5F6', image: '🎂' },
    ],
};

export const BASE_PRICE = 35;
export const DELIVERY_FEE = 8;

// ── Design Patterns ──
export const DESIGN_PATTERNS: Record<string, (c: string, d: string) => React.CSSProperties> = {
    'classic': (c) => ({ background: c }),
    'rustic': (c, d) => ({ background: `repeating-linear-gradient(0deg, ${c}, ${c} 4px, ${d} 4px, ${d} 5px)` }),
    'floral': (c) => ({ background: `radial-gradient(circle at 30% 30%, #F8BBD0 3px, transparent 3px), radial-gradient(circle at 70% 60%, #F8BBD0 3px, transparent 3px), radial-gradient(circle at 50% 80%, #F8BBD0 3px, transparent 3px), ${c}` }),
    'drip': (c, d) => ({ background: `radial-gradient(ellipse at 20% 0%, ${d} 12px, transparent 12px), radial-gradient(ellipse at 50% 0%, ${d} 16px, transparent 16px), radial-gradient(ellipse at 80% 0%, ${d} 10px, transparent 10px), ${c}` }),
    'ombre': (c) => ({ background: `linear-gradient(180deg, ${c}, #CE93D8)` }),
    'geometric': (c) => ({ background: `linear-gradient(135deg, ${c} 25%, transparent 25%), linear-gradient(225deg, ${c} 25%, transparent 25%), linear-gradient(45deg, #90CAF9 25%, transparent 25%), linear-gradient(315deg, #90CAF9 25%, transparent 25%), ${c}`, backgroundSize: '20px 20px' }),
    'marble': (c) => ({ background: `linear-gradient(120deg, ${c} 0%, #CFD8DC 30%, ${c} 50%, #B0BEC5 70%, ${c} 100%)` }),
    'gold-accent': (c) => ({ background: `linear-gradient(135deg, ${c} 0%, #FFD700 15%, ${c} 30%, #FFD700 85%, ${c} 100%)` }),
};

// ── Size Dimensions ──
export const SIZE_DIMS: Record<string, { w: number; h: number }> = {
    small: { w: 90, h: 50 },
    medium: { w: 110, h: 55 },
    large: { w: 130, h: 60 },
    tiered: { w: 115, h: 45 },
};

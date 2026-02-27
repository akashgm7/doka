import { useState, useEffect, useRef } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { fetchUserNotifications, type UserNotification } from '../services/notificationService';

const NotificationBell = () => {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Load notifications when user is logged in
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchUserNotifications();
                setNotifications(data);
                // Mark all as unread initially (compare with what's stored)
                const readKey = `notif-read-${user._id}`;
                const readSet = new Set<string>(JSON.parse(localStorage.getItem(readKey) || '[]'));
                const freshUnread = new Set<string>(data.map(n => n._id).filter(id => !readSet.has(id)));
                setUnreadIds(freshUnread);
            } catch (e) {
                // Silently fail — notifications are non-critical
            } finally {
                setLoading(false);
            }
        };
        load();
        // Poll every 60s for new notifications
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, [user]);

    // Close panel when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Mark all as read when opening
    const handleOpen = () => {
        setIsOpen(v => !v);
        if (!isOpen && user && unreadIds.size > 0) {
            const readKey = `notif-read-${user._id}`;
            const allIds = notifications.map(n => n._id);
            localStorage.setItem(readKey, JSON.stringify(allIds));
            setUnreadIds(new Set());
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
            ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    const unreadCount = unreadIds.size;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-2.5 text-text-muted hover:text-text-main hover:bg-black/5 rounded-xl transition-all group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 transition-transform group-active:scale-90" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-2 right-2 bg-accent text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg shadow-accent/20 border-2 border-white"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 mt-3 w-[min(90vw,380px)] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-accent/10 border border-black/5 overflow-hidden z-50 flex flex-col"
                        style={{ maxHeight: '70vh' }}
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-primary/50">
                            <div>
                                <h3 className="font-serif font-bold text-text-main text-lg">Notifications</h3>
                                <p className="text-[10px] text-text-muted/60 mt-0.5 uppercase tracking-widest font-bold">
                                    {notifications.length === 0 ? 'No alerts' : `${notifications.length} experience${notifications.length !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10">
                                <Sparkles className="w-5 h-5 text-accent/60" />
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar" style={{ maxHeight: '50vh' }}>
                            {loading && notifications.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] text-text-muted/40 mt-4 tracking-[0.2em] uppercase font-bold">Refining your feed</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-24 text-center px-8">
                                    <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center mx-auto mb-6 border border-black/5 shadow-inner">
                                        <Bell className="w-10 h-10 text-text-muted/20" />
                                    </div>
                                    <p className="text-base font-serif font-bold text-text-main mb-2">Serenity Achieved</p>
                                    <p className="text-xs text-text-muted/60 leading-relaxed max-w-[220px] mx-auto">
                                        We'll notify you when new artisanal creations and exclusive offers arrive.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-black/5">
                                    {notifications.map((n) => {
                                        const isUnread = unreadIds.has(n._id);
                                        return (
                                            <li
                                                key={n._id}
                                                className={`px-6 py-6 transition-all duration-300 relative group ${isUnread ? 'bg-accent-[0.02]' : 'hover:bg-primary/30'}`}
                                            >
                                                {isUnread && <div className="absolute left-0 top-6 bottom-6 w-1 bg-accent rounded-r-full" />}
                                                <div className="flex gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <p className={`text-sm font-bold truncate transition-colors ${isUnread ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[9px] text-text-muted/40 font-bold uppercase tracking-widest whitespace-nowrap ml-2">
                                                                {formatDate(n.sentAt).split(' · ')[1]}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-text-muted/70 leading-relaxed line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                        <p className="text-[9px] text-accent/60 mt-3 font-bold uppercase tracking-[0.15em]">
                                                            {formatDate(n.sentAt).split(' · ')[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-6 py-4 border-t border-black/5 bg-primary/30 text-center">
                                <button className="text-[10px] text-accent uppercase tracking-[0.2em] font-bold hover:text-accent-dark transition-colors">
                                    Archive All Messages
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;

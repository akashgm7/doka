import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import AddressMap from '../components/AddressMap';
import {
    User, Mail, Phone, MapPin, Shield, LogOut,
    Plus, Trash2, Home, Briefcase, Map as MapIcon,
    ChevronRight, Camera, Save, X, Bell, Award, Heart, Sparkles
} from 'lucide-react';
import OrderHistory from '../components/OrderHistory';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import CakeCard from '../components/CakeCard';

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuthStore();
    const { favorites, clearFavorites } = useFavoritesStore();
    const { resetLocalCart } = useCartStore();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'security' | 'notifications' | 'orders' | 'favorites'>(
        (searchParams.get('tab') as 'details' | 'addresses' | 'security' | 'notifications' | 'orders' | 'favorites') || 'details'
    );

    // Notification Preferences State
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: true,
        deliveryAlerts: true,
        seasonalDrops: false,
        newsletter: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setMessage(`Preference updated`);
        setMessageType('success');
        setTimeout(() => setMessage(''), 2000);
    };

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [mobile, setMobile] = useState(user?.mobile || '');

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Address Management State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        addressLine: '',
        city: '',
        zipCode: '',
        coordinates: null as { lat: number; lng: number } | null,
    });

    // UI State
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    const [allCakes, setAllCakes] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'favorites' && allCakes.length === 0) {
            const fetchCakes = async () => {
                try {
                    const { data } = await api.get('/api/cakes');
                    setAllCakes(data.cakes);
                } catch (error) {
                    console.error('Failed to fetch cakes for favorites', error);
                }
            };
            fetchCakes();
        }
    }, [activeTab]);

    const favoriteCakes = allCakes.filter(cake => favorites.includes(cake._id));

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setMobile(user.mobile || '');
        }
    }, [user]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab as any);
    }, [searchParams]);

    const hasToken = !!localStorage.getItem('auth-storage') &&
        JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token;

    if ((!user && !hasToken) || (hasToken && !user && isLoading)) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center p-4 bg-primary">
                <div className="text-center p-10 bg-white rounded-3xl border border-black/5 shadow-xl max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
                    <User className="w-16 h-16 text-text-muted/20 mx-auto mb-6" />
                    <h2 className="text-3xl font-serif font-bold text-text-main mb-2">Access Restricted</h2>
                    <p className="text-text-muted/60 mb-8 text-sm">Please identify yourself to access the Atelier.</p>
                    <Link to="/login" className="inline-block w-full bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-xl shadow-accent/20 hover:scale-[1.02]">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-primary">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-accent animate-pulse" />
                </div>
            </div>
        );
    }

    const fetchAddressDetails = async (lat: number, lng: number) => {
        try {
            setIsLoading(true);
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const city = addr.city || addr.town || addr.village || addr.county || '';
                const zip = addr.postcode || '';
                const line = [addr.house_number, addr.road, addr.suburb].filter(Boolean).join(', ');

                setNewAddress(prev => ({
                    ...prev,
                    addressLine: line || data.display_name.split(',')[0],
                    city: city,
                    zipCode: zip,
                    coordinates: { lat, lng }
                }));
            }
        } catch (error) {
            setNewAddress(prev => ({ ...prev, coordinates: { lat, lng } }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!newAddress.coordinates) {
            setMessage('Please select a location on the map'); setMessageType('error'); return;
        }

        setIsLoading(true);
        try {
            if (!newAddress.label || !newAddress.addressLine || !newAddress.city || !newAddress.zipCode) {
                setMessage('Please fill in all required fields'); setMessageType('error'); setIsLoading(false); return;
            }

            const response = await api.post('/api/users/address', newAddress);
            updateUser(response.data);
            setIsAddingAddress(false);
            setNewAddress({ label: 'Home', addressLine: '', city: '', zipCode: '', coordinates: null });
            setMessage('Location saved successfully'); setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to add address'); setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        setIsLoading(true);
        try {
            const response = await api.delete(`/api/users/address/${addressToDelete}`);
            updateUser(response.data);
            setMessage('Location removed'); setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to delete address'); setMessageType('error');
        } finally {
            setIsLoading(false); setAddressToDelete(null);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (mobile && !/^[0-9]{10}$/.test(mobile)) {
            setMessage('Enter a valid 10-digit mobile number'); setMessageType('error'); return;
        }

        setIsLoading(true);
        try {
            const response = await api.put('/api/users/profile', { name, email, mobile });
            updateUser(response.data);
            setIsEditingProfile(false);
            setMessage('Profile updated'); setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Update failed'); setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (newPassword.length < 6) { setMessage('Password too short'); setMessageType('error'); return; }
        if (newPassword !== confirmPassword) { setMessage('Passwords do not match'); setMessageType('error'); return; }

        setIsLoading(true);
        try {
            const { data } = await api.put('/api/users/profile', { oldPassword: currentPassword, newPassword: newPassword });
            updateUser(data);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setMessage('Security credentials updated'); setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Update failed'); setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const TABS = [
        { id: 'details', label: 'Identity', icon: User },
        { id: 'orders', label: 'Order History', icon: Briefcase },
        { id: 'addresses', label: 'Locations', icon: MapPin },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Preferences', icon: Bell },
        { id: 'favorites', label: 'Saved', icon: Heart },
    ] as const;

    const SessionDiagnostic = () => {
        const state = useAuthStore.getState();
        const [lsData, setLsData] = useState<string | null>(null);

        useEffect(() => {
            setLsData(localStorage.getItem('auth-storage'));
        }, []);

        return (
            <div className="mt-8 p-4 bg-black/80 rounded-2xl border border-white/10 font-mono text-[10px] text-green-400 overflow-hidden">
                <p className="font-bold border-b border-white/10 pb-2 mb-2 text-white">Diagnostic Atelier Session</p>
                <p>User: {state.user ? '✅' : '❌'}</p>
                <p>Token: {state.token ? `✅ (...${state.token.slice(-6)})` : '❌'}</p>
                <p>Hydrated: {state._hasHydrated ? '✅' : '❌'}</p>
                <p className="mt-2 text-white/40">Storage: {lsData ? 'Present' : 'Missing'}</p>
                <button 
                  onClick={() => { window.location.reload(); }}
                  className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Force Hard Reset
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-primary">
            {/* Ambient effects */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left: Navigation & Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-black/5 overflow-hidden sticky top-28 shadow-xl relative"
                        >
                            {/* Profile Header Block */}
                            <div className="p-8 text-center relative border-b border-black/5 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0" />

                                <div className="w-24 h-24 mx-auto mb-5 rounded-full p-1 bg-gradient-to-br from-accent to-accent-light flex items-center justify-center relative z-10 shadow-xl shadow-accent/20 group cursor-pointer">
                                    <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden relative">
                                        <span className="text-3xl font-serif font-bold text-accent uppercase">{user.name ? user.name.charAt(0) : 'U'}</span>
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <Camera className="w-6 h-6 text-text-main" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-serif font-bold text-text-main relative z-10">{user.name || 'Esteemed Guest'}</h1>
                                <p className="text-text-muted/60 text-sm mt-1 relative z-10">{user.email}</p>

                                {user.isAdmin && (
                                    <div className="mt-4 flex justify-center relative z-10">
                                        <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" /> System Admin
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Loyalty Points Mini-Card */}
                            <div className="px-6 py-5 border-b border-black/5 bg-accent/5 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-24 h-24 bg-accent/10 rounded-full blur-xl group-hover:bg-accent/20 transition-all"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Atelier Points</p>
                                            <p className="text-[10px] text-text-muted/60 mt-0.5">Earn 10% on orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-serif font-bold text-text-main">{user?.loyaltyPoints ? user.loyaltyPoints.toLocaleString() : '0'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <nav className="space-y-1">
                                    {TABS.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border ${isActive
                                                    ? 'bg-accent/10 border-accent/20 text-accent shadow-sm'
                                                    : 'bg-transparent border-transparent text-text-muted hover:bg-black/5 hover:text-text-main'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
                                                {tab.label}
                                                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-accent" />}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-6 pt-6 border-t border-black/5 px-4">
                                    <p className="text-xs text-center text-text-muted/40 mb-5 font-medium">Member since {formatDate(user.createdAt || new Date().toISOString())}</p>
                                    <button onClick={() => { clearFavorites(); resetLocalCart(); logout(); }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-500 rounded-xl hover:bg-red-100 transition-all text-xs font-bold uppercase tracking-wider"
                                    >
                                        <LogOut className="w-3.5 h-3.5" /> Secure Sign Out
                                    </button>
                                </div>
                                <div className="px-4 pb-8">
                                    <SessionDiagnostic />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Main Content Area */}
                    <div className="lg:col-span-8">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-black/5 p-6 sm:p-10 shadow-xl min-h-[600px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-50" />

                            <AnimatePresence mode="popLayout">
                                {message && (
                                    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className={`mb-8 p-4 rounded-xl flex items-center gap-3 border backdrop-blur-md ${messageType === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${messageType === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {/* DETAILS TAB */}
                                {activeTab === 'details' && (
                                    <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl">
                                        <div className="flex justify-between items-end mb-8 border-b border-black/5 pb-6">
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-text-main mb-2">Identity Details</h2>
                                                <p className="text-text-muted/40 text-sm">Manage your personal information.</p>
                                            </div>
                                            {!isEditingProfile && (
                                                <button onClick={() => setIsEditingProfile(true)} className="text-[10px] uppercase font-bold text-accent hover:text-text-main transition-colors tracking-widest bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>

                                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Full Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 w-5 h-5 group-focus-within:text-accent transition-colors" />
                                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditingProfile}
                                                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20 disabled:opacity-50 disabled:bg-primary/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="relative group">
                                                    <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Email Address</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 w-5 h-5 group-focus-within:text-accent transition-colors" />
                                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditingProfile}
                                                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20 disabled:opacity-50 disabled:bg-primary/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="relative group">
                                                    <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Mobile Number</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 w-5 h-5 group-focus-within:text-accent transition-colors" />
                                                        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={!isEditingProfile} placeholder="Add secure contact number"
                                                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20 disabled:opacity-50 disabled:bg-primary/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {isEditingProfile && (
                                                <div className="flex gap-4 pt-6 mt-6 border-t border-black/5">
                                                    <button type="button" onClick={() => setIsEditingProfile(false)}
                                                        className="px-6 py-3 border border-black/10 text-text-muted rounded-xl text-xs font-bold hover:bg-black/5 transition-all uppercase tracking-wider"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button type="submit" disabled={isLoading}
                                                        className="flex-1 py-3 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl font-bold tracking-wide transition-all shadow-xl shadow-accent/20 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
                                                    >
                                                        {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Identity</>}
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    </motion.div>
                                )}

                                {/* ORDERS TAB */}
                                {activeTab === 'orders' && (
                                    <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <OrderHistory />
                                    </motion.div>
                                )}

                                {/* ADDRESSES TAB */}
                                {activeTab === 'addresses' && (
                                    <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="flex justify-between items-end mb-8 border-b border-black/5 pb-6">
                                            <h2 className="text-3xl font-serif font-bold text-text-main">Saved Coordinates</h2>
                                            <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent/20 transition-all uppercase tracking-wider">
                                                <Plus className="w-3.5 h-3.5" /> New Location
                                            </button>
                                        </div>

                                        {isAddingAddress ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/30 p-8 rounded-3xl border border-black/5 relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="font-serif font-bold text-xl text-text-main">Pinpoint Location</h3>
                                                    <button onClick={() => setIsAddingAddress(false)} className="text-text-muted/40 hover:text-text-main p-2">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <form onSubmit={handleAddAddress} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Label</label>
                                                            <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                                className="w-full p-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main text-sm"
                                                            >
                                                                <option value="Home">Home Base</option>
                                                                <option value="Office">Office</option>
                                                                <option value="Other">Custom Point</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Postal Code</label>
                                                            <input type="text" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} required placeholder="Enter code"
                                                                className="w-full p-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Full Address Line</label>
                                                        <input type="text" value={newAddress.addressLine} onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })} required placeholder="Suite, Building, Street"
                                                            className="w-full p-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20"
                                                        />
                                                    </div>

                                                    <div className="rounded-2xl overflow-hidden border border-white/10 relative h-64 shadow-inner">
                                                        <div className="absolute top-4 left-4 z-[1000] bg-[#0a0a14]/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                                            <MapIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Interactive Map
                                                        </div>
                                                        <AddressMap onLocationSelect={fetchAddressDetails} />
                                                    </div>

                                                    <div className="flex justify-end pt-4">
                                                        <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-[#D4AF37] to-[#f0d060] text-[#0a0a14] px-8 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all disabled:opacity-70 flex items-center gap-2">
                                                            {isLoading ? <div className="animate-spin w-4 h-4 border-2 border-[#0a0a14]/30 border-t-[#0a0a14] rounded-full" /> : <Save className="w-4 h-4" />}
                                                            Confirm Coordinates
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {user?.addresses?.map((addr) => (
                                                    <motion.div key={addr._id} whileHover={{ y: -5 }} className="group bg-surface border border-black/5 rounded-3xl p-6 relative hover:border-accent/40 hover:bg-primary/30 shadow-sm transition-all duration-300">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary border border-black/5 text-text-main group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/30 transition-all">
                                                                {addr.label === 'Home' ? <Home className="w-5 h-5" /> : addr.label === 'Office' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                                            </div>
                                                            <button onClick={() => setAddressToDelete(addr._id)} className="text-text-muted/20 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="mb-3">
                                                            <span className="text-[10px] font-bold uppercase text-accent tracking-widest">{addr.label}</span>
                                                            <h4 className="font-bold text-text-main leading-snug mt-1">{addr.addressLine}</h4>
                                                        </div>
                                                        <p className="text-sm text-text-muted/60 flex items-center gap-1.5 font-medium">
                                                            <MapPin className="w-3.5 h-3.5" /> {addr.city} — {addr.zipCode}
                                                        </p>
                                                    </motion.div>
                                                ))}

                                                {user?.addresses?.length === 0 && (
                                                    <div className="col-span-full py-16 text-center bg-primary/20 rounded-3xl border border-dashed border-black/10">
                                                        <MapIcon className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                                                        <p className="text-text-muted/70 font-medium">No coordinates registered.</p>
                                                        <p className="text-xs text-text-muted/40 mt-1">Add a location to enable exclusive delivery.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* SECURITY TAB */}
                                {activeTab === 'security' && (
                                    <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl">
                                        <h2 className="text-3xl font-serif font-bold text-text-main mb-2">Vault Security</h2>
                                        <p className="text-text-muted/40 text-sm mb-8 border-b border-black/5 pb-6">Update your access credentials.</p>

                                        <div className="bg-accent/5 border border-accent/20 p-5 rounded-2xl mb-8 flex items-start gap-4">
                                            <div className="bg-accent/10 p-2.5 rounded-xl text-accent flex-shrink-0 border border-accent/20">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-main text-sm">Protocol Requirements</h4>
                                                <p className="text-[10px] text-text-muted/60 mt-1 leading-relaxed">
                                                    Ensure your key is at least 6 characters long. Complex phrases incorporating numbers and symbols provide optimal protection for your Atelier account.
                                                </p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordUpdate} className="space-y-5">
                                            <div className="relative group">
                                                <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Current Key</label>
                                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                                                    className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">New Key</label>
                                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                                                    className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-[10px] font-bold text-text-muted/50 mb-1.5 uppercase tracking-widest pl-1">Confirm New Key</label>
                                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                                    className="w-full px-5 py-3.5 bg-surface border border-black/10 rounded-xl focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-text-main placeholder-text-muted/20"
                                                />
                                            </div>

                                            <div className="pt-6 mt-4 border-t border-black/5">
                                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-accent to-accent-light text-white py-3.5 rounded-xl text-sm font-bold tracking-wide shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                                    {isLoading ? 'Encrypting...' : 'Update Security Key'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* NOTIFICATIONS TAB */}
                                {activeTab === 'notifications' && (
                                    <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl">
                                        <div className="flex items-center gap-4 mb-8 border-b border-black/5 pb-6">
                                            <div className="w-12 h-12 bg-primary border border-black/5 rounded-2xl flex items-center justify-center">
                                                <Bell className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-text-main">Communications</h2>
                                                <p className="text-sm text-text-muted/40 mt-1">Configure how the Atelier reaches you.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { key: 'orderUpdates' as const, title: 'Courier Updates', desc: 'Real-time status of your bespoke creations.' },
                                                { key: 'deliveryAlerts' as const, title: 'Proximity Alerts', desc: 'Notifications when your delivery artisan is near.' },
                                                { key: 'promotions' as const, title: 'Private Invitations', desc: 'Exclusive access to member-only events and pieces.' },
                                                { key: 'seasonalDrops' as const, title: 'Seasonal Debuts', desc: 'Advance notice for limited-edition seasonal collections.' },
                                                { key: 'newsletter' as const, title: 'The Journal', desc: 'Curated stories on gastronomy, art, and the Atelier lifestyle.' },
                                            ].map(({ key, title, desc }) => (
                                                <div key={key} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-black/5 hover:border-accent/20 transition-all group">
                                                    <div className="flex-1 pr-6">
                                                        <h4 className="font-bold text-text-main text-sm tracking-wide">{title}</h4>
                                                        <p className="text-[10px] text-text-muted/50 mt-1">{desc}</p>
                                                    </div>
                                                    <button onClick={() => toggleNotification(key)}
                                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 border ${notifications[key] ? 'bg-accent/20 border-accent shadow-sm' : 'bg-primary/50 border-black/10'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${notifications[key] ? 'bg-accent left-[calc(100%-1.25rem)]' : 'bg-text-muted/40 left-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* FAVORITES TAB */}
                                {activeTab === 'favorites' && (
                                    <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="flex items-center gap-3 mb-8 border-b border-black/5 pb-6">
                                            <Heart className="w-6 h-6 text-red-500 fill-red-500/10" />
                                            <div>
                                                <h2 className="text-3xl font-serif font-bold text-text-main">Curated Collection</h2>
                                                <p className="text-text-muted/40 text-sm">Pieces you've marked for future indulgence.</p>
                                            </div>
                                        </div>

                                        {favoriteCakes.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {favoriteCakes.map((cake) => (
                                                    <CakeCard key={cake._id} id={cake._id} name={cake.name} price={cake.price} image={cake.image} rating={cake.rating} brand={cake.brand} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 bg-primary/20 rounded-3xl border border-dashed border-black/10">
                                                <Heart className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                                                <p className="text-text-main font-serif text-lg mb-2">Your collection is empty.</p>
                                                <p className="text-xs text-text-muted/40 mb-8">Save masterpieces you desire to acquire later.</p>
                                                <Link to="/shop" className="inline-block bg-gradient-to-r from-accent to-accent-light text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                                                    Enter Boutique
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {addressToDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white border border-black/5 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-text-main text-center mb-3">Remove Location?</h3>
                            <p className="text-text-muted/60 text-center mb-8 text-sm leading-relaxed">Are you certain you wish to purge these coordinates from the Atelier records?</p>
                            <div className="flex gap-4">
                                <button onClick={() => setAddressToDelete(null)} className="flex-1 py-3.5 border border-black/10 text-text-muted rounded-xl text-xs font-bold hover:bg-black/5 transition-all uppercase tracking-wider">
                                    Cancel
                                </button>
                                <button onClick={confirmDeleteAddress} className="flex-1 py-3.5 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all uppercase tracking-wider">
                                    Purge
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;

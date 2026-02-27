import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import AddressMap from '../components/AddressMap';
import { User, MapPin, Phone, ArrowRight, SkipForward, Check, Loader, Navigation } from 'lucide-react';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { user, setCredentials } = useAuthStore();
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'found' | 'denied'>('idle');
    const [error, setError] = useState('');

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Auto-fetch live location when step 2 is entered
    useEffect(() => {
        if (step === 2 && locationStatus === 'idle') {
            fetchLiveLocation();
        }
    }, [step]);

    const fetchLiveLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            return;
        }

        setLocationStatus('fetching');
        setIsFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setCoordinates({ lat, lng });
                await fetchAddressDetails(lat, lng);
                setLocationStatus('found');
                setIsFetchingLocation(false);
            },
            (err) => {
                console.warn('Geolocation denied:', err.message);
                setLocationStatus('denied');
                setIsFetchingLocation(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const fetchAddressDetails = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const cityVal = addr.city || addr.town || addr.village || addr.county || '';
                const zipVal = addr.postcode || '';
                const lineVal = [addr.house_number, addr.road, addr.suburb].filter(Boolean).join(', ');

                setAddressLine(lineVal || data.display_name.split(',')[0]);
                setCity(cityVal);
                setZipCode(zipVal);
                setCoordinates({ lat, lng });
            }
        } catch (error) {
            console.error('Failed to fetch address details:', error);
            setCoordinates({ lat, lng });
        }
    };

    // Step 1 Skip: go to step 2, do NOT save mobile, do NOT exit
    const handleSkipMobile = () => {
        setError('');
        setStep(2);
    };

    // Step 1 Next: validate mobile, save it, then go to step 2
    const handleSaveMobile = async () => {
        setError('');
        if (mobile && !/^[0-9]{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        if (mobile) {
            setIsLoading(true);
            try {
                const profileRes = await api.put('/api/users/profile', { mobile });
                const updatedData = { ...profileRes.data };
                if (!updatedData.token && user?.token) updatedData.token = user.token;
                setCredentials(updatedData);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to save mobile');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }
        setStep(2);
    };

    // Step 2 Finish: save address if details available, then navigate
    const handleSaveAddress = async () => {
        setError('');

        // If no address at all, just skip to app
        if (!addressLine && !city && !zipCode && !coordinates) {
            navigate(next);
            return;
        }

        if (!addressLine || !city || !zipCode) {
            setError('Please fill in all address fields (Address, City, Zip Code)');
            return;
        }

        setIsLoading(true);
        try {
            const addressData = {
                label: 'Home',
                addressLine,
                city,
                zipCode,
                coordinates: coordinates || undefined,
            };
            const addressRes = await api.post('/api/users/address', addressData);
            const updatedData = { ...addressRes.data };
            if (!updatedData.token && user?.token) updatedData.token = user.token;
            setCredentials(updatedData);
            navigate(next);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] pointer-events-none" style={{ background: 'radial-gradient(circle, #C5A028, transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-3xl w-full rounded-[2.5rem] shadow-[0_30px_80px_rgba(197,160,40,0.1)] border border-black/5 overflow-hidden flex flex-col md:flex-row relative z-10"
            >
                {/* Left Side - Visual */}
                <div className="bg-primary/30 p-10 md:w-5/12 flex flex-col justify-center items-center text-center relative overflow-hidden border-r border-black/5">
                    {/* Subtle glow inside left panel */}
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-accent/20 bg-gradient-to-br from-accent to-accent-light">
                        <User className="text-white w-10 h-10" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-text-main mb-3 relative z-10">Welcome, {user?.name?.split(' ')[0]}!</h2>
                    <p className="text-sm text-text-muted/60 relative z-10 leading-relaxed max-w-[200px]">Let's set up your profile for a bespoke experience.</p>

                    {/* Step Dots */}
                    <div className="mt-12 flex gap-3 relative z-10">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-accent shadow-sm' : 'w-2 bg-black/10'}`} />
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-accent shadow-sm' : 'w-2 bg-black/10'}`} />
                    </div>

                    <p className="text-[10px] text-text-muted/30 mt-6 uppercase tracking-[0.2em] font-bold relative z-10">
                        Step {step} of 2
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="p-10 md:w-7/12">
                    <h3 className="text-2xl font-bold text-text-main mb-8 font-serif">
                        {step === 1 ? 'Contact Details' : 'Delivery Address'}
                    </h3>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                    <AnimatePresence mode="wait">
                        {/* ── Step 1: Mobile ── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-bold text-text-muted/60 mb-3">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/30 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="10-digit mobile number"
                                            className="w-full pl-12 pr-4 py-4 bg-surface border border-black/10 rounded-xl focus:ring-2 focus:ring-accent/30 focus:border-accent text-text-main transition-all placeholder:text-text-muted/30"
                                        />
                                    </div>
                                    <p className="text-[11px] text-text-muted/40 mt-3 leading-relaxed">Used for order updates and tracking your masterpiece.</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 mt-6 border-t border-black/5">
                                    {/* Skip goes to Step 2, NOT out of onboarding */}
                                    <button onClick={handleSkipMobile} className="text-text-muted/40 hover:text-text-main font-bold flex items-center gap-1.5 text-xs uppercase tracking-widest transition-colors">
                                        <SkipForward className="w-4 h-4" /> Skip
                                    </button>
                                    <button
                                        onClick={handleSaveMobile}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-accent to-accent-light text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-xl shadow-accent/20 transition-all flex items-center gap-2 disabled:opacity-70 uppercase tracking-widest text-xs"
                                    >
                                        {isLoading ? 'Saving...' : 'Next'} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Step 2: Address ── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* GPS Status Banner */}
                                {locationStatus === 'fetching' && (
                                    <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest">
                                        <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
                                        Fetching live location…
                                    </div>
                                )}
                                {locationStatus === 'found' && (
                                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-xs font-bold leading-relaxed">
                                        <Navigation className="w-4 h-4 flex-shrink-0" />
                                        Live location detected! You can adjust the details below.
                                    </div>
                                )}
                                {locationStatus === 'denied' && (
                                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-bold leading-relaxed">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        Location access denied. Tap the map to pin your address manually.
                                    </div>
                                )}

                                {/* Map */}
                                <div className="h-48 rounded-2xl overflow-hidden border border-black/10 relative">
                                    <AddressMap onLocationSelect={fetchAddressDetails} />
                                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-black/5 flex items-center gap-1.5 pointer-events-none text-text-main shadow-sm">
                                        <MapPin className="w-3 h-3 text-accent" /> Tap to adjust location
                                    </div>
                                    {/* Re-fetch GPS button */}
                                    <button
                                        onClick={fetchLiveLocation}
                                        disabled={isFetchingLocation}
                                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-black/5 flex items-center gap-1.5 hover:bg-white transition-colors disabled:opacity-60 text-text-main shadow-sm uppercase tracking-wider"
                                    >
                                        {isFetchingLocation
                                            ? <Loader className="w-3 h-3 animate-spin text-accent" />
                                            : <Navigation className="w-3 h-3 text-accent" />
                                        }
                                        My Location
                                    </button>
                                </div>

                                {/* Address Fields (auto-filled from GPS) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-text-muted/60 mb-1.5 tracking-widest">City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full p-3 bg-surface border border-black/10 rounded-xl text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-text-main placeholder:text-text-muted/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-text-muted/60 mb-1.5 tracking-widest">Zip Code</label>
                                        <input
                                            type="text"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            className="w-full p-3 bg-surface border border-black/10 rounded-xl text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-text-main placeholder:text-text-muted/30"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-text-muted/60 mb-1.5 tracking-widest">Address Line</label>
                                    <input
                                        type="text"
                                        value={addressLine}
                                        onChange={(e) => setAddressLine(e.target.value)}
                                        placeholder="House/Flat No, Street"
                                        className="w-full p-3 bg-surface border border-black/10 rounded-xl text-sm focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-text-main placeholder:text-text-muted/30"
                                    />
                                </div>

                                <div className="flex justify-between pt-6 mt-6 border-t border-black/5 items-center">
                                    <button onClick={() => setStep(1)} className="text-text-muted/40 hover:text-text-main font-bold text-xs uppercase tracking-widest transition-colors">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSaveAddress}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-accent to-accent-light text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-xl shadow-accent/20 transition-all flex items-center gap-2 disabled:opacity-70 uppercase tracking-widest text-xs"
                                    >
                                        {isLoading ? 'Saving...' : 'Finish Setup'} <Check className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-center pt-2">
                                    <button onClick={() => navigate(next)} className="text-[10px] text-text-muted/30 hover:text-text-main uppercase tracking-widest font-bold transition-colors">
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingPage;

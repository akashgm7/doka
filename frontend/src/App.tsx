import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// Layout
import MainLayout from './layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import ReadyMadeCakesPage from './pages/ReadyMadeCakesPage';
import MakeMyCakePage from './pages/MakeMyCakePage';
import AddOnsPage from './pages/AddOnsPage';
import SplashScreen from './components/SplashScreen';
import MouseGlow from './components/MouseGlow';
import { useAuthStore } from './store/useAuthStore';
import { useFavoritesStore } from './store/useFavoritesStore';
import { useCartStore } from './store/useCartStore';
import api from './services/api';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Component to handle initialization logic
const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const { setCredentials, logout, _hasHydrated } = useAuthStore();
  const { fetchFavorites, clearFavorites } = useFavoritesStore();
  const { resetLocalCart } = useCartStore();

  useEffect(() => {
    const initApp = async () => {
      // 1. Wait for store hydration to be certain token is available
      if (!_hasHydrated) return;

      const isFirstVisit = !localStorage.getItem('hasVisited');
      const token = useAuthStore.getState().token;

      if (token) {
        try {
          const { data } = await api.get('/api/users/me');

          setCredentials({ ...data, token });
          if (data.cart) {
            useCartStore.getState().setCart(data.cart);
          }
          // Load this user's favorites from MongoDB
          await fetchFavorites();
        } catch (error) {
          console.error('Session validation failed:', error);
          clearFavorites();
          resetLocalCart();
          logout();
        }
      }

      // 2. Delay for splash screen animation
      await new Promise(resolve => setTimeout(resolve, 2500));

      setLoading(false);

      if (isFirstVisit) {
        localStorage.setItem('hasVisited', 'true');
      }
    };

    initApp();
  }, [_hasHydrated]);


  return (
    <>
      <MouseGlow />
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>

      {!loading && (
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/ready-made" element={<ReadyMadeCakesPage />} />
            <Route path="/make-my-cake" element={<MakeMyCakePage />} />
            <Route path="/add-ons" element={<AddOnsPage />} />
          </Routes>
        </MainLayout>
      )}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;

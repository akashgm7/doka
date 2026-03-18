
import { useAuthStore } from './src/store/useAuthStore';
import api from './src/services/api';

// Mocking the scenario of a page refresh
console.log('--- Initial State ---');
console.log('Hydrated:', useAuthStore.getState()._hasHydrated);
console.log('Token:', useAuthStore.getState().token);

// Try a request while not hydrated
console.log('--- Requesting While Not Hydrated ---');
api.get('/api/test').catch(() => {}); 

// Simulate hydration
console.log('--- Simulating Hydration ---');
useAuthStore.getState().setHasHydrated(true);
useAuthStore.getState().setCredentials({ token: 'mock-token' } as any);

console.log('--- State After Hydration ---');
console.log('Hydrated:', useAuthStore.getState()._hasHydrated);
console.log('Token:', useAuthStore.getState().token);

// Try a request while hydrated
console.log('--- Requesting While Hydrated ---');
api.get('/api/test').catch(() => {});

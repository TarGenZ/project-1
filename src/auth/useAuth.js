import { useContext } from 'react';
import { AuthContext } from './AuthProvider.jsx';

/**
 * The only way any component should read auth state. Never call
 * AuthService.getSession() or subscribe to onAuthStateChange directly
 * outside of AuthProvider — this hook is the single source of truth.
 * @returns {import('./authTypes').AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used within an <AuthProvider>.');
  }
  return ctx;
}

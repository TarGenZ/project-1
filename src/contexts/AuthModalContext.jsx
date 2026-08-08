import { createContext, useContext, useState } from 'react';
import AuthModal from '../components/AuthModal.jsx';

const AuthModalContext = createContext(null);

/**
 * Mounted once, above the router — makes the login/signup popup triggerable
 * from anywhere (Navbar, ProtectedRoute's sign-in prompt, etc.) without
 * every caller needing its own copy of the modal or its open/close state.
 */
export function AuthModalProvider({ children }) {
  const [step, setStep] = useState(null); // 'login' | 'signup' | null

  const openAuthModal = (initialStep = 'login') => setStep(initialStep);
  const closeAuthModal = () => setStep(null);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      {step && <AuthModal initialStep={step} onClose={closeAuthModal} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal() must be used within an <AuthModalProvider>.');
  }
  return ctx;
}

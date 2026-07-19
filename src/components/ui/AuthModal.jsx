import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export default function AuthModal() {
  const { closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    reset();

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        closeAuthModal();
        navigate('/dashboard');
      }
    } else {
      if (!fullName.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    }
    setLoading(false);
  }

  function handleGoogle() {
    closeAuthModal();
    signInWithGoogle();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
      >
        <motion.div
          className="auth-box"
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <Zap size={16} fill="currentColor" />
              <span>Arpan<span className="auth-logo-accent">Mentors</span></span>
            </div>
            <button className="auth-close" onClick={closeAuthModal}><X size={18} /></button>
          </div>

          <div className="auth-body">
            <h2 className="auth-title">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="auth-sub">
              {mode === 'signin'
                ? 'Sign in to access your sessions and dashboard.'
                : 'Join ArpanMentors and start your NEET prep journey.'}
            </p>

            {/* Google button */}
            <button className="btn-google" onClick={handleGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="auth-divider"><span>or</span></div>

            {/* Email form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label>Full name</label>
                  <div className="field-wrap">
                    <User size={15} className="field-icon" />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label>Email address</label>
                <div className="field-wrap">
                  <Mail size={15} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus={mode === 'signin'}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="field-wrap">
                  <Lock size={15} className="field-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-eye"
                    onClick={() => setShowPass(s => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading
                  ? 'Please wait…'
                  : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="auth-toggle">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); reset(); }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

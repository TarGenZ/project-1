import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import {
  signInWithPassword, signInWithEmailOtp, verifyEmailOtp, confirmEmailVerification,
  signUpWithPassword, verifySignupOtp, requestPasswordReset, verifyRecoveryOtp,
} from '../auth/AuthService.js';
import { CODE_LENGTH } from '../auth/authTypes.js';
import OAuthButtons from '../auth/components/OAuthButtons.jsx';
import InvisibleCaptcha from './InvisibleCaptcha.jsx';

const LABEL = 'mt-4 block text-xs font-medium text-white/50';
const INPUT = 'mt-1.5 w-full rounded-lg border border-line/40 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet/60 focus:bg-violet/5';
const BTN_PRIMARY = 'mt-5 w-full rounded-full bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50';
const LINK = 'text-amber underline underline-offset-4 hover:text-amber/80';

export default function AuthModal({ onClose, initialStep = 'login', next = '/dashboard' }) {
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  // 'login' | 'signup' | 'code' — 'code' covers signup-verify, login-OTP and
  // password-reset codes; `codeContext` tells verify() which one it's for.
  const [step,        setStep]        = useState(initialStep);
  const [codeContext, setCodeContext] = useState('signup');

  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [code,          setCode]          = useState('');
  const [error,         setError]         = useState(null);
  const [busy,          setBusy]          = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);

  const finish = () => { onClose(); navigate(next, { replace: true }); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); setShowForgot(false); setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signInWithPassword(email, password, captchaToken);
      finish();
    } catch (err) {
      setError(err.message || 'Wrong email or password.');
      setShowForgot(true);
    } finally { setBusy(false); }
  };

  const handlePasswordlessLogin = async () => {
    if (!email) { setError('Enter your email above first.'); return; }
    setError(null); setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signInWithEmailOtp(email, { captchaToken, shouldCreateUser: false });
      setCodeContext('login-otp'); setCode(''); setStep('code');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email above first.'); return; }
    setError(null); setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await requestPasswordReset(email, captchaToken);
      setCodeContext('forgot'); setCode(''); setStep('code');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signUpWithPassword(email, password, { captchaToken, data: { full_name: name.trim() } });
      setCodeContext('signup'); setCode(''); setStep('code');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      if (codeContext === 'signup') {
        await verifySignupOtp(email, code);
        try { await confirmEmailVerification(); } catch { /* dashboard's own gate covers this */ }
        finish();
      } else if (codeContext === 'login-otp') {
        await verifyEmailOtp(email, code);
        try { await confirmEmailVerification(); } catch { /* see above */ }
        finish();
      } else {
        await verifyRecoveryOtp(email, code);
        onClose();
        navigate('/reset-password', { replace: true });
      }
    } catch (err) { setError(err.message); setCode(''); } finally { setBusy(false); }
  };

  const ErrorBox = () => error && (
    <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
      {error}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line/70 bg-panel/95 p-7 shadow-glow"
        >
          {/* subtle decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-violet/20 blur-[80px]"
          />

          <button onClick={onClose} aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>

          {step === 'login' && (
            <div className="relative">
              <h1 className="font-display text-xl font-semibold text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-white/50">One account, works on every app on arpansarkar.org.</p>
              <p className="mt-4 text-xs text-white/40">
                New here?{' '}
                <button type="button" onClick={() => { setError(null); setStep('signup'); }} className={LINK}>
                  Create an account
                </button>
              </p>

              <form onSubmit={handleLogin}>
                <label className={LABEL}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={INPUT} autoFocus />

                <label className={LABEL}>Password</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" placeholder="••••••••"
                    className={`${INPUT} mt-0 pr-11`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <ErrorBox />
                {showForgot && (
                  <button type="button" onClick={handleForgotPassword} disabled={busy}
                    className={`mt-2 text-xs font-medium ${LINK}`}>
                    Forgot Password?
                  </button>
                )}

                <button type="submit" disabled={busy} className={BTN_PRIMARY}>
                  {busy ? 'Logging in…' : 'Log in'}
                </button>
                <button type="button" onClick={handlePasswordlessLogin} disabled={busy}
                  className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70">
                  No password set? Email me a code instead
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-line/40" />
                <span className="text-xs text-white/30">or</span>
                <div className="h-px flex-1 bg-line/40" />
              </div>

              <OAuthButtons next={next} onError={setError} />
            </div>
          )}

          {step === 'signup' && (
            <div className="relative">
              <h1 className="font-display text-xl font-semibold text-white">Create your account</h1>
              <p className="mt-1 text-sm text-white/50">One account, works on every app on arpansarkar.org.</p>
              <p className="mt-4 text-xs text-white/40">
                Already have an account?{' '}
                <button type="button" onClick={() => { setError(null); setStep('login'); }} className={LINK}>
                  Log in
                </button>
              </p>

              <form onSubmit={handleSignup}>
                <label className={LABEL}>Full name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" className={INPUT} autoFocus />

                <label className={LABEL}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={INPUT} />

                <label className={LABEL}>Password</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" placeholder="At least 8 characters"
                    className={`${INPUT} mt-0 pr-11`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <ErrorBox />
                <button type="submit" disabled={busy} className={BTN_PRIMARY}>
                  {busy ? 'Creating…' : 'Create account'}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-line/40" />
                <span className="text-xs text-white/30">or</span>
                <div className="h-px flex-1 bg-line/40" />
              </div>

              <OAuthButtons next={next} onError={setError} />
            </div>
          )}

          {step === 'code' && (
            <div className="relative">
              <button type="button"
                onClick={() => { setStep(codeContext === 'signup' ? 'signup' : 'login'); setError(null); }}
                className="mb-1 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
                <ArrowLeft size={12} /> back
              </button>
              <h1 className="font-display text-xl font-semibold text-white">
                {codeContext === 'forgot' ? 'Enter the reset code' : 'Enter your code'}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {codeContext === 'forgot' ? `Sent to ${email}.` : `We sent a ${CODE_LENGTH}-digit code to ${email}.`}
              </p>

              <form onSubmit={handleVerifyCode}>
                <input
                  type="text" inputMode="numeric" autoFocus maxLength={CODE_LENGTH}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={'1'.repeat(CODE_LENGTH)}
                  className={`${INPUT} text-center text-base tracking-[0.25em] placeholder:tracking-normal`}
                />
                <ErrorBox />
                <button type="submit" disabled={busy || code.length !== CODE_LENGTH} className={BTN_PRIMARY}>
                  {busy ? 'Verifying…' : 'Verify & continue'}
                </button>
              </form>
            </div>
          )}

          <InvisibleCaptcha ref={captchaRef} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

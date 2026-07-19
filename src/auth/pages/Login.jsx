import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPassword, signInWithEmailOtp, verifyEmailOtp, confirmEmailVerification } from '../AuthService';
import { CODE_LENGTH } from '../authTypes';
import AuthLayout from '../components/AuthLayout.jsx';
import OAuthButtons from '../components/OAuthButtons.jsx';
import InvisibleCaptcha from '../../components/InvisibleCaptcha.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import SEO from '../../components/SEO.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [step, setStep] = useState('form'); // 'form' | 'code'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showForgotLink, setShowForgotLink] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const captchaRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setShowForgotLink(false);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signInWithPassword(email, password, captchaToken);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || 'Wrong email or password.');
      setShowForgotLink(true);
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordlessLogin = async () => {
    if (!email) {
      setError('Enter your email above first.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signInWithEmailOtp(email, { captchaToken, shouldCreateUser: false });
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyEmailOtp(email, code);
      try {
        await confirmEmailVerification();
      } catch (confirmErr) {
        console.error('[Login] confirmEmailVerification failed:', confirmErr.message);
      }
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthLayout
        title="Enter your code"
        subtitle={`We sent a ${CODE_LENGTH}-digit code to ${email}.`}
      >
        <SEO title="Log in — arpansarkar.org" path="/login" noindex />
        <button
          type="button"
          onClick={() => setStep('form')}
          className="mb-3 text-xs text-white/40 hover:text-white/70"
        >
          ← back
        </button>
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder={'1'.repeat(CODE_LENGTH)}
            className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-center text-base tracking-[0.25em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.length !== CODE_LENGTH}
            className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify & continue'}
          </button>
        </form>
        <InvisibleCaptcha ref={captchaRef} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="One account, works on every app on arpansarkar.org.">
      <SEO title="Log in — arpansarkar.org" path="/login" noindex />
      <p className="mt-4 text-xs text-white/40">
        New here?{' '}
        <Link to={`/signup?next=${encodeURIComponent(next)}`} className="text-amber underline underline-offset-4">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleLogin}>
        <label className="mt-5 block text-xs font-medium text-white/50">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
        />

        <label className="mt-4 block text-xs font-medium text-white/50">Password</label>
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1.5"
        />

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        {showForgotLink && (
          <Link
            to={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="mt-2 inline-block text-xs font-medium text-amber underline underline-offset-4 hover:text-amber/80"
          >
            Forgot Password?
          </Link>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <button
          type="button"
          onClick={handlePasswordlessLogin}
          disabled={busy}
          className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70"
        >
          No password set? Email me a code instead
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-white/30">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <OAuthButtons next={next} onError={setError} />
      <InvisibleCaptcha ref={captchaRef} />
    </AuthLayout>
  );
}

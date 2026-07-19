import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signUpWithPassword, verifySignupOtp, confirmEmailVerification } from '../AuthService';
import { CODE_LENGTH } from '../authTypes';
import AuthLayout from '../components/AuthLayout.jsx';
import OAuthButtons from '../components/OAuthButtons.jsx';
import InvisibleCaptcha from '../../components/InvisibleCaptcha.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import SEO from '../../components/SEO.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [step, setStep] = useState('form'); // 'form' | 'code'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const captchaRef = useRef(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await signUpWithPassword(email, password, { captchaToken, data: { full_name: name.trim() } });
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifySignupOtp(email, code);
      // verifySignupOtp() already confirmed the email at Supabase's auth
      // level — flip is_verified here too so ProtectedRoute doesn't ask
      // for a SECOND code the moment they land on /dashboard. Best-effort:
      // if this fails for some reason, the dashboard's own verify gate is
      // still there as a fallback, so we don't block navigation on it.
      try {
        await confirmEmailVerification();
      } catch (confirmErr) {
        console.error('[Signup] confirmEmailVerification failed:', confirmErr.message);
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
        <SEO title="Verify your email — arpansarkar.org" path="/signup" noindex />
        <form onSubmit={handleVerify}>
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
    <AuthLayout title="Create your account" subtitle="One account, works on every app on arpansarkar.org." backTo="/login">
      <SEO title="Sign up — arpansarkar.org" path="/signup" noindex />
      <p className="mt-4 text-xs text-white/40">
        Already have an account?{' '}
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-amber underline underline-offset-4">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSignup}>
        <label className="mt-5 block text-xs font-medium text-white/50">Full name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
        />

        <label className="mt-4 block text-xs font-medium text-white/50">Email</label>
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className="mt-1.5"
        />

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create account'}
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

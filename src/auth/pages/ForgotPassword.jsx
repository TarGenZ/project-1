import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { requestPasswordReset, verifyRecoveryOtp } from '../AuthService';
import { CODE_LENGTH } from '../authTypes';
import AuthLayout from '../components/AuthLayout.jsx';
import InvisibleCaptcha from '../../components/InvisibleCaptcha.jsx';
import SEO from '../../components/SEO.jsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const captchaRef = useRef(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const captchaToken = await captchaRef.current.getToken();
      await requestPasswordReset(email, captchaToken);
      setCode('');
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
      await verifyRecoveryOtp(email, code);
      // verifyRecoveryOtp establishes a short-lived recovery session —
      // ResetPassword reads it via useAuth() rather than us passing state.
      navigate('/reset-password', { replace: true });
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthLayout title="Enter the reset code" subtitle={`Sent to ${email}.`}>
        <SEO title="Reset your password — arpansarkar.org" path="/forgot-password" noindex />
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
            {busy ? 'Verifying…' : 'Verify code'}
          </button>
        </form>
        <InvisibleCaptcha ref={captchaRef} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a code to confirm it's you." backTo="/login">
      <SEO title="Reset your password — arpansarkar.org" path="/forgot-password" noindex />
      <form onSubmit={handleSendCode}>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send reset code'}
        </button>
      </form>
      <InvisibleCaptcha ref={captchaRef} />
    </AuthLayout>
  );
}

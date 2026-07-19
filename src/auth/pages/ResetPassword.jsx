import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { updatePassword } from '../AuthService';
import { useAuth } from '../useAuth';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import SEO from '../../components/SEO.jsx';

/**
 * Requires the short-lived recovery session that ForgotPassword's
 * verifyRecoveryOtp() establishes. If someone lands here without one
 * (e.g. a stale bookmark), send them back to start the flow properly —
 * no crash, no dead end.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await updatePassword(newPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="You'll be logged in right after this." backTo="/login">
      <SEO title="Set a new password — arpansarkar.org" path="/reset-password" noindex />
      <form onSubmit={handleSubmit}>
        <PasswordField
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className="mt-5"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthLayout>
  );
}

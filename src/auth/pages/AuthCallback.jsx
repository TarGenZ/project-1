import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import SEO from '../../components/SEO.jsx';

const TIMEOUT_MS = 10000;

/**
 * Every app on arpansarkar.org needs this exact route. It deliberately does
 * NOT call getSession() or subscribe to auth changes itself — the Supabase
 * client already parses the OAuth/magic-link tokens from the URL
 * (detectSessionInUrl: true), and AuthProvider's single listener picks up
 * the resulting SIGNED_IN event. This page just waits for that to reflect
 * in useAuth() and then redirects, so there's exactly one listener in the
 * whole app, not two.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const startRef = useRef(Date.now());

  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || '/';

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate(next, { replace: true });
      return;
    }
    const remaining = TIMEOUT_MS - (Date.now() - startRef.current);
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, navigate, next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <SEO title="Signing in… — arpansarkar.org" path="/auth/callback" noindex />
      <div className="text-center">
        {timedOut ? (
          <>
            <p className="font-display text-xl text-white mb-2">Sign-in didn't go through</p>
            <p className="text-white/60 text-sm">
              That took longer than expected — please try signing in again.
            </p>
            <a href="/login" className="inline-block mt-6 text-amber underline underline-offset-4">
              Back to login
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 h-8 w-8 rounded-full border-2 border-violet border-t-transparent animate-spin" />
            <p className="font-display text-white/80">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}

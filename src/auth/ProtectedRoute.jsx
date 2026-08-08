import { useAuth } from './useAuth';
import { useAuthModal } from '../contexts/AuthModalContext.jsx';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
    </div>
  );
}

function SignInPrompt() {
  const { openAuthModal } = useAuthModal();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="font-display text-xl text-white">Sign in to see this page</p>
      <button
        type="button"
        onClick={() => openAuthModal('login')}
        className="mt-4 text-amber underline underline-offset-4"
      >
        Sign in
      </button>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center">
      <p className="font-display text-xl text-white">You don't have access to this page</p>
      <a href="/" className="mt-4 text-amber underline underline-offset-4">
        Back to homepage
      </a>
    </div>
  );
}

/**
 * ProtectedRoute checks exactly three things, nothing more:
 *   loading      - is the initial session check (and, if signed in, the
 *                  profile fetch) still in flight?
 *   authenticated - is there a session at all?
 *   authorized   - (optional) does this route need admin?
 *
 * Deliberately does NOT gate on email verification anymore — Google
 * accounts are auto-verified at the DB trigger level (Google's own OAuth
 * IS the verification), and password accounts get verified immediately
 * after their signup code. Any leftover onboarding (name/class) is handled
 * as a non-blocking overlay by the page itself, not by this route guard.
 *
 * @param {{children: React.ReactNode, requireAdmin?: boolean}} props
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, profileLoading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!isAuthenticated) return <SignInPrompt />;
  if (profileLoading) return <FullScreenSpinner />;
  if (requireAdmin && !isAdmin) return <NotAuthorized />;

  return children;
}

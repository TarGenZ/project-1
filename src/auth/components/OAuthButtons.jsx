import { signInWithGoogle } from '../AuthService';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.4 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14-5l-6.5-5.3c-2 1.5-4.6 2.3-7.5 2.3-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.6 40.5 16.2 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.7l6.5 5.3C41.6 35.6 45 30.5 45 24c0-1.4-.1-2.5-.4-3.5z" />
  </svg>
);

/**
 * @param {{onError?: (message: string) => void, next?: string}} props
 */
export default function OAuthButtons({ onError, next }) {
  const handleGoogle = async () => {
    try {
      await signInWithGoogle(next);
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-base py-2.5 text-sm font-semibold text-white transition hover:border-violet/50"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton.jsx';

/**
 * Shared card chrome for every auth page (Login, Signup, ForgotPassword,
 * ResetPassword). Keeps the same centered-card look the old JoinModal had,
 * just as a full page instead of an overlay.
 */
export default function AuthLayout({ title, subtitle, backTo, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6 py-12">
      <BackButton fallback={backTo || '/'} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-7 shadow-glow"
      >
        {title && <h1 className="font-display text-xl font-semibold text-white">{title}</h1>}
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        {children}
      </motion.div>
    </div>
  );
}

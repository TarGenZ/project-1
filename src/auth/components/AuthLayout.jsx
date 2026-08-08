import { motion } from 'framer-motion';

/**
 * Shared card chrome for every auth page (Login, Signup, ForgotPassword,
 * ResetPassword). Keeps the same centered-card look the old JoinModal had,
 * just as a full page instead of an overlay.
 */
export default function AuthLayout({ title, subtitle, backTo, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-6 py-12">
      {/* Subtle decorative glow behind the card — echoes the blurred-backdrop
          feel of the ecosystem's popup auth modal without being an overlay. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/10 blur-[100px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="relative w-full max-w-sm rounded-2xl border border-line/70 bg-panel/95 p-7 shadow-glow backdrop-blur-sm"
      >
        {title && <h1 className="font-display text-xl font-semibold text-white">{title}</h1>}
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        {children}
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOnboarding } from '../../auth/AuthService';
import { CLASS_LEVELS } from '../../auth/authTypes';

/**
 * Shown once, right after signup — for BOTH email and Google accounts — to
 * collect name + class together in one popup. Deliberately has no captcha
 * or OTP dependency (unlike the old verification-code flow it replaces for
 * gating dashboard access), so there's nothing here that can hang or crash
 * and leave the page blank.
 *
 * Rendered as an overlay on top of the dashboard (which is always mounted
 * underneath), not swapped in for it — so even if this modal had a bug,
 * the dashboard itself stays visible and functional.
 */
export default function OnboardingModal({ userId, prefillName, onSaved }) {
  const [name, setName] = useState(prefillName || '');
  const [classLevel, setClassLevel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !classLevel) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await completeOnboarding(userId, { fullName: trimmed, classLevel });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="w-full max-w-sm rounded-2xl border border-line bg-panel p-7 shadow-glow"
        >
          <h2 className="font-display text-xl font-semibold text-white">Welcome! Quick setup</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/55">
            Two quick things so we can personalize your dashboard.
          </p>

          <label className="mt-5 block text-xs font-medium text-white/50">Your name</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1.5 w-full rounded-lg border border-line bg-base px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-white/35">You can only set this once, so get it right.</p>

          <label className="mt-4 block text-xs font-medium text-white/50">Which class are you in?</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {CLASS_LEVELS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setClassLevel(option.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  classLevel === option.value
                    ? 'border-violet bg-violet/15 text-white'
                    : 'border-line bg-base text-white/60 hover:border-violet/40 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy || !name.trim() || !classLevel}
            className="mt-5 w-full rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Continue'}
          </button>
        </motion.form>
      </div>
    </AnimatePresence>
  );
}

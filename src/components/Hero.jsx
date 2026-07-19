import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const ROTATING_PHRASES = [
  'AIR under 1000',
  'your dream medical college',
  'NEET success in 1 year',
  'top govt MBBS seat',
  'a study plan that works',
];

export default function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => setPhraseIdx((i) => (i + 1) % ROTATING_PHRASES.length), 2400);
    return () => clearInterval(interval);
  }, []);

  const scrollToPricing = () => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative overflow-hidden px-5 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet/25 blur-[100px]" />
      <div className="pointer-events-none absolute top-40 right-10 h-56 w-56 rounded-full bg-amber/10 blur-[100px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet/40 bg-violet/10 px-3.5 py-1.5 text-xs font-medium text-lavender"
        >
          <Sparkles size={14} />
          <span>NEET UG Mentorship — Limited Spots</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-bold leading-tight text-white md:text-6xl"
        >
          Your shortcut to
          <br />
          <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIdx}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="inline-block bg-gradient-to-r from-violet-soft to-lavender bg-clip-text text-transparent"
              >
                {ROTATING_PHRASES[phraseIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg"
        >
          I'm Arpan — a NEET qualifier who's been exactly where you are. I mentor serious aspirants
          with a personalised strategy that cuts through the noise and gets results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={scrollToPricing}
            className="flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-soft"
          >
            See plans <ArrowRight size={16} />
          </button>
          {!isAuthenticated && (
            <a
              href="/login"
              className="rounded-full border border-line px-6 py-3 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
            >
              Sign in / Sign up
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-14 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {[
            { value: '2 hrs', label: 'daily dedicated to you' },
            { value: '14', label: 'personal spots (limited)' },
            { value: '1', label: 'group batch only' },
            { value: '1-on-1', label: 'Zoom sessions' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-xs text-white/45">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

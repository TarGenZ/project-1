import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Hero.css';

const ROTATING_PHRASES = [
  'AIR under 1000',
  'your dream medical college',
  'NEET success in 1 year',
  'top govt MBBS seat',
  'a study plan that works',
];

export default function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(i => (i + 1) % ROTATING_PHRASES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const scrollToPricing = () =>
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hero">
      {/* Ambient glow */}
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={14} />
          <span>NEET UG 2025 Mentorship — Limited Spots</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your shortcut to
          <br />
          <span className="hero-rotating-wrapper">
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIdx}
                className="hero-rotating-text"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                {ROTATING_PHRASES[phraseIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          I'm Arpan — a NEET qualifier who's been exactly where you are. I mentor serious aspirants with a personalised strategy that cuts through the noise and gets results.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button className="btn-hero-primary" onClick={scrollToPricing}>
            Book a Session <ArrowRight size={16} />
          </button>
          {!user && (
            <button className="btn-hero-secondary" onClick={openAuthModal}>
              Sign in / Sign up
            </button>
          )}
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { value: '2 hrs', label: 'daily dedicated to you' },
            { value: '14', label: 'personal spots (limited)' },
            { value: '1', label: 'group batch only' },
            { value: '1-on-1', label: 'Zoom sessions' },
          ].map(s => (
            <div className="stat" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="scroll-dot" />
      </motion.div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'How it works', href: '#process' },
  { label: 'Plans', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { loading, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href) => {
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? 'border-line/70 bg-base/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-1.5 font-display text-lg font-bold text-white">
          <Zap size={18} className="text-amber" fill="currentColor" />
          Arpan<span className="text-amber">Mentors</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNavClick(l.href)}
              className="text-sm text-white/60 transition hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-panel" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full border border-line px-4 py-1.5 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-white/50 transition hover:border-violet/50 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-soft"
            >
              Get Started
            </Link>
          )}
        </div>

        <button className="text-white/70 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line/70 px-5 md:hidden"
          >
            <div className="flex flex-col gap-1 py-3">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleNavClick(l.href)}
                  className="rounded-lg px-2 py-2.5 text-left text-sm text-white/70 hover:bg-panel"
                >
                  {l.label}
                </button>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm text-white/70 hover:bg-panel"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="rounded-lg px-2 py-2.5 text-left text-sm text-white/50 hover:bg-panel"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-lg bg-violet px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

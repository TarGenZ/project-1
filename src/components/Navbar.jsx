import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../contexts/ThemeContext.jsx';
import AuthModal from './AuthModal.jsx';

const NAV_LINKS = [
  { label: 'About',        href: '#about' },
  { label: 'How it works', href: '#process' },
  { label: 'Plans',        href: '#pricing' },
  { label: 'FAQ',          href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerH,    setHeaderH]    = useState(57);
  const [authModal,  setAuthModal]  = useState(null); // 'login' | 'signup' | null

  const headerRef = useRef(null);
  const { loading, isAuthenticated, user, signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate  = useNavigate();

  // ── Measure header height so the mobile panel snaps flush below it ─────────
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(Math.round(entry.contentRect.height) + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Lock body scroll while the mobile overlay is open ─────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── Collapse mobile menu on ≥ md resize ───────────────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeNav = () => setMobileOpen(false);
  const openAuth = () => { setMobileOpen(false); setAuthModal('login'); };

  const handleNavClick = (href) => {
    closeNav();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Theme-aware classes ────────────────────────────────────────────────────
  // Drive icon / hover colours directly from isDark so the icon is NEVER
  // invisible after a dynamic toggle (the CSS-override path has a timing lag
  // between applyTheme() and the browser repaint on some Android Chromium builds).
  const toggleCls = isDark
    ? 'rounded-full border border-line/60 p-2 text-white/50 transition hover:border-violet/40 hover:text-white'
    : 'rounded-full border border-line/60 p-2 text-[#0A0F1E]/60 transition hover:border-violet/40 hover:text-[#0A0F1E]';

  const toggleMobileCls = isDark
    ? 'rounded-full border border-line/60 p-1.5 text-white/50 transition hover:text-white'
    : 'rounded-full border border-line/60 p-1.5 text-[#0A0F1E]/60 transition hover:text-[#0A0F1E]';

  // Auth button pill — identical to project-0's AuthButton BTN constant
  const BTN =
    'flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-sm text-white/70 transition hover:border-violet/50 hover:text-white';

  const initial = (user?.email || 'A').charAt(0).toUpperCase();

  return (
    <>
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-line/70 bg-base/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-page items-center gap-2 px-4 py-3 sm:px-5">

          {/* Logo — links back to the main domain */}
          <a
            href="https://www.arpansarkar.org"
            className="mr-3 flex-shrink-0 font-display text-base font-bold tracking-tight text-white sm:text-lg"
          >
            arpan<span className="text-amber">sarkar</span><span className="text-white/30">.org</span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => handleNavClick(l.href)}
                className="rounded-full px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-panel hover:text-white"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop right: theme toggle → auth */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <button onClick={toggle} aria-label="Toggle theme" className={toggleCls}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-panel" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className={BTN}>Dashboard</Link>
                <button
                  onClick={signOut}
                  title={`Signed in as ${user?.email || ''} — click to sign out`}
                  className={BTN}
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-[#fff]">
                    {initial}
                  </span>
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuth}
                className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft"
              >
                Register/Sign In
              </button>
            )}
          </div>

          {/* Mobile right: theme toggle + animated hamburger */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button onClick={toggle} aria-label="Toggle theme" className={toggleMobileCls}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-white"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <div className="relative h-3.5 w-4">
                <span className={`absolute left-0 top-0 h-[1.5px] w-full bg-current transition-all duration-200 ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current transition-all duration-200 ${mobileOpen ? 'scale-x-0 opacity-0' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-current transition-all duration-200 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile: blurred backdrop ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mob-backdrop"
            className="fixed inset-0 z-30 md:hidden"
            style={{ top: headerH }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeNav}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: frosted panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mob-panel"
            className="fixed left-0 right-0 z-40 md:hidden overflow-y-auto overscroll-contain"
            style={{ top: headerH, maxHeight: `calc(100dvh - ${headerH}px)` }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-base/[0.96] backdrop-blur-2xl border-b border-line/50 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)]">
              <div className="px-4 pb-6 pt-3">

                {/* Nav links */}
                <div className="flex flex-col gap-0.5">
                  {NAV_LINKS.map((l) => (
                    <button
                      key={l.label}
                      onClick={() => handleNavClick(l.href)}
                      className="rounded-lg px-3 py-2.5 text-left text-sm text-white/70 transition hover:bg-panel hover:text-white"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Auth — compact pills, side-by-side, centred — matches project-0 exactly */}
                <div className="mt-3 border-t border-line/70 pt-4">
                  {loading ? (
                    <div className="h-8 w-full animate-pulse rounded-full bg-panel" />
                  ) : isAuthenticated ? (
                    <div className="flex w-full items-center justify-center gap-2">
                      <Link to="/dashboard" onClick={closeNav} className={BTN}>
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { signOut(); closeNav(); }}
                        title={`Signed in as ${user?.email || ''} — click to sign out`}
                        className={BTN}
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet text-[10px] font-bold text-[#fff]">
                          {initial}
                        </span>
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full justify-center">
                      <button
                        type="button"
                        onClick={openAuth}
                        className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft"
                      >
                        Register/Sign In
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {authModal && (
        <AuthModal initialStep={authModal} onClose={() => setAuthModal(null)} />
      )}
    </>
  );
}

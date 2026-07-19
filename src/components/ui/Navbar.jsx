import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, signOut, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'How it works', href: '#process' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href) => {
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <Zap size={20} fill="currentColor" />
          <span>Arpan<span className="logo-accent">Mentors</span></span>
        </Link>

        <div className="nav-links">
          {navLinks.map(l => (
            <button key={l.label} className="nav-link" onClick={() => handleNavClick(l.href)}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="nav-cta">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-nav-dash">Dashboard</Link>
              <button className="btn-nav-out" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <button className="btn-nav-primary" onClick={openAuthModal}>
              Get Started
            </button>
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navLinks.map(l => (
              <button key={l.label} className="mobile-link" onClick={() => handleNavClick(l.href)}>
                {l.label}
              </button>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="mobile-link" onClick={() => setOpen(false)}>Dashboard</Link>
                <button className="mobile-link" onClick={() => { signOut(); setOpen(false); }}>Sign out</button>
              </>
            ) : (
              <button className="mobile-cta" onClick={() => { openAuthModal(); setOpen(false); }}>
                Get Started →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

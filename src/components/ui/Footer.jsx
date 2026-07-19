import { Zap } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Zap size={18} fill="currentColor" />
          <span>Arpan<span style={{ color: 'var(--lavender)' }}>Mentors</span></span>
        </div>
        <p className="footer-tagline">NEET UG mentorship that actually works.</p>
        <p className="footer-copy">© {new Date().getFullYear()} Arpan Sarkar. All rights reserved.</p>
      </div>
    </footer>
  );
}

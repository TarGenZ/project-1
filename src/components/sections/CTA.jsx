import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CTA.css';

const WHATSAPP_NUMBER = '919999999999'; // Replace with actual number
const WHATSAPP_MSG = encodeURIComponent("Hi Arpan! I'm interested in NEET mentorship. Can you tell me more?");

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { user, signInWithGoogle } = useAuth();

  const scrollToPricing = () =>
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="cta-section" ref={ref}>
      <div className="cta-glow" />
      <div className="section-inner">
        <motion.div
          className="cta-box"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-eyebrow">Limited spots remaining</div>

          <h2 className="cta-title">
            The best time to start was last year.<br />
            The second best time is <span className="grad-text">right now.</span>
          </h2>

          <p className="cta-desc">
            Every week you wait is a week without a strategy. Don't let another mock test pass without knowing why you got those questions wrong.
          </p>

          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={scrollToPricing}>
              Book a session now <ArrowRight size={16} />
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-whatsapp"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>

          <p className="cta-reassure">
            Not sure yet? Message on WhatsApp — no pressure, just a conversation.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

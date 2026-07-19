import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';

const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '';
const WHATSAPP_DIGITS = CONTACT_PHONE.replace(/\D/g, '');
const WHATSAPP_MSG = encodeURIComponent("Hi Arpan! I'm interested in NEET mentorship. Can you tell me more?");

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const scrollToPricing = () => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-line/70 px-5 py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[100px]" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-2xl rounded-3xl border border-violet/30 bg-panel p-8 text-center md:p-12"
      >
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-amber">
          Limited spots remaining
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">
          The best time to start was last year.
          <br />
          The second best time is{' '}
          <span className="bg-gradient-to-r from-violet-soft to-lavender bg-clip-text text-transparent">
            right now.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/55">
          Every week you wait is a week without a strategy. Don't let another mock test pass without
          knowing why you got those questions wrong.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={scrollToPricing}
            className="flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-soft"
          >
            See plans <ArrowRight size={16} />
          </button>
          {WHATSAPP_DIGITS && (
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm text-white/70 transition hover:border-violet/50 hover:text-white"
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>
          )}
        </div>
        <p className="mt-4 text-xs text-white/35">Not sure yet? Message on WhatsApp — no pressure, just a conversation.</p>
      </motion.div>
    </section>
  );
}

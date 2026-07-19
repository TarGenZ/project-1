import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import './FAQ.css';

const FAQS = [
  {
    q: 'Who is this mentorship for?',
    a: 'This is for serious NEET UG aspirants who are done with the "just study more" advice and want an actual personalised strategy. Whether you\'re a dropper or appearing for the first time, if you\'re committed — this is for you.',
  },
  {
    q: 'How are sessions conducted?',
    a: 'All sessions happen over Zoom. For personal mentorship, it\'s a dedicated 1-hour 1-on-1 call. For group mentorship, it\'s a 1-hour group session with other aspirants in the batch.',
  },
  {
    q: 'What happens after I book a session?',
    a: 'You\'ll receive a confirmation email with your Zoom link. For personal mentorship, we\'ll also do a quick intake form to understand your background before our first call.',
  },
  {
    q: 'Can I switch from group to personal mentorship?',
    a: 'Yes, you can upgrade to personal mentorship any time if there\'s a spot available. Just reach out on WhatsApp and we\'ll sort it.',
  },
  {
    q: 'What\'s the difference between per-session and yearly billing?',
    a: 'Per session means you pay ₹199 (group) or ₹1,000 (personal) each time you book. Yearly means you commit to 52 sessions over the year (1/week) and pay upfront — same per-session rate, no discount, but consistent access and guaranteed spot.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Sessions cancelled 24 hours in advance can be rescheduled. Refunds are not offered for completed sessions or missed sessions without prior notice. For yearly plans, please contact before purchasing if you have concerns.',
  },
  {
    q: 'How do I reach you between sessions?',
    a: 'Personal mentorship students get direct WhatsApp access to me. Group mentorship students have access to a dedicated WhatsApp group where I answer questions regularly.',
  },
  {
    q: 'What if all spots are full?',
    a: 'Join the waitlist via WhatsApp and you\'ll be the first to know when a spot opens. Spots do occasionally open when students complete their target or take a break.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <Minus size={18} /> : <Plus size={18} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="faq" id="faq" ref={ref}>
      <div className="section-inner">
        <motion.div
          className="section-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          FAQ
        </motion.div>

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          Got questions?<br />
          <span className="grad-text">We've got answers.</span>
        </motion.h2>

        <motion.div
          className="faq-list"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {FAQS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

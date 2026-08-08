import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'Who is this mentorship for?',
    a: 'This is for serious NEET UG aspirants who are done with the "just study more" advice and want an actual personalised strategy. Whether you\'re a dropper or appearing for the first time, if you\'re committed — this is for you.',
  },
  {
    q: 'How are sessions conducted?',
    a: "All sessions happen over Zoom. For personal mentorship, it's a dedicated 1-on-1 call. For group mentorship, it's a group session with other aspirants in the batch.",
  },
  {
    q: 'How do I buy a plan?',
    a: 'Plans are purchased on arpansarkar.org — once payment goes through, the plan shows up unlocked in your dashboard here, and you can pick your session date/slot.',
  },
  {
    q: 'Can I switch from group to personal mentorship?',
    a: 'Yes, you can upgrade to personal mentorship any time if there\'s a spot available. Just reach out on WhatsApp and we\'ll sort it.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Sessions cancelled 24 hours in advance can be rescheduled. Refunds are not offered for completed sessions or missed sessions without prior notice.',
  },
  {
    q: 'How do I reach you between sessions?',
    a: 'Personal mentorship students get direct WhatsApp access to me. Group mentorship students have access to a dedicated WhatsApp group where I answer questions regularly.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line/70 py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 text-left">
        <span className="font-medium text-white">{q}</span>
        {open ? <Minus size={18} className="shrink-0 text-white/40" /> : <Plus size={18} className="shrink-0 text-white/40" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-relaxed text-white/50">{a}</p>
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
    <section id="faq" ref={ref} className="border-t border-line/70 px-5 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-xs font-medium uppercase tracking-[0.2em] text-amber"
        >
          FAQ
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-3xl font-bold text-white md:text-4xl"
        >
          Got questions? We've got answers.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          {FAQS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

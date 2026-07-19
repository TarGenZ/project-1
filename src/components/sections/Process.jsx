import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Process.css';

const STEPS = [
  {
    num: '01',
    title: 'Book your spot',
    desc: 'Choose your plan, pay securely via Razorpay. Spots are limited and fill fast — seriously.',
    accent: 'violet',
  },
  {
    num: '02',
    title: 'Diagnostic deep-dive',
    desc: "First Zoom call: we map your strengths, gaps, timeline, and mindset. I'll know exactly where to focus.",
    accent: 'lavender',
  },
  {
    num: '03',
    title: 'Your custom roadmap',
    desc: 'I build a subject-wise weekly schedule around your life. Realistic targets, not fantasy goals.',
    accent: 'amber',
  },
  {
    num: '04',
    title: 'Execute & iterate',
    desc: 'Weekly Zoom sessions + WhatsApp check-ins. We review mocks, fix leaks, and keep the momentum going.',
    accent: 'violet',
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="process" id="process" ref={ref}>
      <div className="section-inner">
        <motion.div
          className="section-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          How it works
        </motion.div>

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          From confused aspirant<br />
          <span className="grad-text">to confident ranker.</span>
        </motion.h2>

        <div className="process-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className={`process-card accent-${step.accent}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
            >
              <div className="process-num">{step.num}</div>
              <div className="process-body">
                <h3 className="process-title">{step.title}</h3>
                <p className="process-desc">{step.desc}</p>
              </div>
              <div className="process-connector" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

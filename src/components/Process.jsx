import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Get your plan',
    desc: 'Choose your plan on arpansarkar.org and pay securely. Spots are limited and fill fast — seriously.',
  },
  {
    num: '02',
    title: 'Diagnostic deep-dive',
    desc: "First Zoom call: we map your strengths, gaps, timeline, and mindset. I'll know exactly where to focus.",
  },
  {
    num: '03',
    title: 'Your custom roadmap',
    desc: 'I build a subject-wise weekly schedule around your life. Realistic targets, not fantasy goals.',
  },
  {
    num: '04',
    title: 'Execute & iterate',
    desc: 'Weekly Zoom sessions + WhatsApp check-ins. We review mocks, fix leaks, and keep the momentum going.',
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="process" ref={ref} className="border-t border-line/70 px-5 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-xs font-medium uppercase tracking-[0.2em] text-amber"
        >
          How it works
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-3xl font-bold text-white md:text-4xl"
        >
          From confused aspirant
          <br />
          <span className="bg-gradient-to-r from-violet-soft to-lavender bg-clip-text text-transparent">
            to confident ranker.
          </span>
        </motion.h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
              className="rounded-2xl border border-line bg-panel p-6"
            >
              <div className="font-display text-3xl font-bold text-white/15">{step.num}</div>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

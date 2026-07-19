import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Target, Clock, MessageCircle, TrendingUp, Shield } from 'lucide-react';

const TRAITS = [
  { icon: Brain, title: 'Strategy over grind', desc: 'I teach you how to think about NEET, not just memorise it. Smart prep beats blind hours.' },
  { icon: Target, title: 'Hyper-personalised', desc: "Your weak subjects, your schedule, your pace. No copy-paste plan — it's built around you." },
  { icon: Clock, title: 'Time-efficient', desc: "I know what actually shows up in NEET and what doesn't. We focus on the 20% that gives 80% marks." },
  { icon: MessageCircle, title: 'Always reachable', desc: 'WhatsApp support between sessions. Stuck on a concept at 11pm? Message me.' },
  { icon: TrendingUp, title: 'Data-driven tracking', desc: 'Weekly progress reviews. We track mock scores, identify patterns, and pivot fast.' },
  { icon: Shield, title: 'Been there done that', desc: 'I cracked NEET. I know the anxiety, the doubt, the pressure. Real talk, no fluff.' },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" ref={ref} className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-xs font-medium uppercase tracking-[0.2em] text-amber"
        >
          About your mentor
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-3xl font-bold text-white md:text-4xl"
        >
          Not a coaching institute.
          <br />
          <span className="bg-gradient-to-r from-violet-soft to-lavender bg-clip-text text-transparent">
            A person who gets it.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl text-white/55"
        >
          I'm Arpan Sarkar — a NEET qualifier from Mangaluru who built my own prep strategy because
          nothing else worked. Now I spend 2 focused hours every day helping aspirants do it smarter.
        </motion.p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRAITS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i + 0.2 }}
              className="rounded-2xl border border-line bg-panel p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/15 text-lavender">
                <t.icon size={18} />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-white">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

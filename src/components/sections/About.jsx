import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Target, Clock, MessageCircle, TrendingUp, Shield } from 'lucide-react';
import './About.css';

const TRAITS = [
  { icon: Brain, title: 'Strategy over grind', desc: 'I teach you how to think about NEET, not just memorise it. Smart prep beats blind hours.' },
  { icon: Target, title: 'Hyper-personalised', desc: "Your weak subjects, your schedule, your pace. No copy-paste plan — it's built around you." },
  { icon: Clock, title: 'Time-efficient', desc: 'I know what actually shows up in NEET and what doesn\'t. We focus on the 20% that gives 80% marks.' },
  { icon: MessageCircle, title: 'Always reachable', desc: 'WhatsApp support between sessions. Stuck on a concept at 11pm? Message me.' },
  { icon: TrendingUp, title: 'Data-driven tracking', desc: 'Weekly progress reviews. We track mock scores, identify patterns, and pivot fast.' },
  { icon: Shield, title: 'Been there done that', desc: 'I cracked NEET. I know the anxiety, the doubt, the pressure. Real talk, no fluff.' },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about" id="about" ref={ref}>
      <div className="section-inner">
        <motion.div
          className="section-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          About your mentor
        </motion.div>

        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Not a coaching institute.<br />
          <span className="grad-text">A person who gets it.</span>
        </motion.h2>

        <motion.p
          className="section-desc"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          I'm Arpan Sarkar — a NEET qualifier from Mangaluru who built my own prep strategy because nothing else worked. Now I spend 2 focused hours every day helping aspirants do it smarter.
        </motion.p>

        <div className="trait-grid">
          {TRAITS.map((t, i) => (
            <motion.div
              key={t.title}
              className="trait-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i + 0.2 }}
            >
              <div className="trait-icon">
                <t.icon size={20} />
              </div>
              <h3 className="trait-title">{t.title}</h3>
              <p className="trait-desc">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

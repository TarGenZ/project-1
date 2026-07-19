import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Users, User, Zap, Star } from 'lucide-react';
import { PLANS } from '../lib/plans';

function Toggle({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-panel p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            value === o.value ? 'bg-violet text-white' : 'text-white/50 hover:text-white'
          }`}
        >
          {o.label}
          {o.badge && <span className="ml-1.5 text-[10px] text-amber">{o.badge}</span>}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, featured, badge, delay, inView }) {
  const isAmber = plan.accent === 'amber';
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
      className={`rounded-2xl border p-6 ${
        featured ? 'border-violet/50 bg-panel shadow-glow' : 'border-line bg-panel'
      }`}
    >
      {badge && (
        <div
          className={`mb-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isAmber ? 'bg-amber/15 text-amber' : 'bg-violet/15 text-lavender'
          }`}
        >
          {badge.icon} {badge.label}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isAmber ? 'bg-amber/15 text-amber' : 'bg-violet/15 text-lavender'}`}>
          {plan.icon === 'users' ? <Users size={17} /> : <User size={17} />}
        </div>
        <div>
          <div className="font-display font-semibold text-white">{plan.name}</div>
          <div className="text-xs text-white/45">{plan.tagline}</div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        {plan.originalPrice && (
          <span className="text-sm text-white/30 line-through">
            ₹{plan.originalPrice.toLocaleString('en-IN')}
          </span>
        )}
        <span className={`font-display text-3xl font-bold ${isAmber ? 'text-amber' : 'text-white'}`}>
          ₹{plan.price.toLocaleString('en-IN')}
        </span>
        <span className="text-sm text-white/40">
          /{plan.billing === 'monthly' ? 'mo' : plan.billing === 'yearly' ? 'yr' : 'session'}
        </span>
        {plan.discountPct && (
          <span className="ml-1 rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-medium text-amber">
            {plan.discountPct}% off
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/60">
            <Check size={14} className={`mt-0.5 shrink-0 ${isAmber ? 'text-amber' : 'text-violet-soft'}`} />
            {f}
          </li>
        ))}
      </ul>

      <a
        href="https://www.arpansarkar.org/plans"
        className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition ${
          isAmber ? 'bg-amber text-base hover:bg-amber/90' : 'bg-violet text-white hover:bg-violet-soft'
        }`}
      >
        Get this plan on arpansarkar.org
      </a>
    </motion.div>
  );
}

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [sessionToggle, setSessionToggle] = useState('personal_session');
  const [monthlyToggle, setMonthlyToggle] = useState('personal_monthly');
  const [billingToggle, setBillingToggle] = useState('monthly');

  const personalSubPlan = billingToggle === 'yearly' ? PLANS.personal_yearly : PLANS.personal_monthly;

  return (
    <section id="pricing" ref={ref} className="border-t border-line/70 px-5 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-xs font-medium uppercase tracking-[0.2em] text-amber"
        >
          Plans
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-3xl font-bold text-white md:text-4xl"
        >
          Invest in your rank.
          <br />
          <span className="bg-gradient-to-r from-violet-soft to-lavender bg-clip-text text-transparent">
            Not just another course.
          </span>
        </motion.h2>
        <p className="mt-3 max-w-xl text-sm text-white/45">
          Plans are purchased on{' '}
          <a href="https://www.arpansarkar.org/plans" className="text-lavender underline underline-offset-2">
            arpansarkar.org
          </a>{' '}
          — once you've got one, it unlocks right here in your dashboard.
        </p>

        {/* Row 1: single sessions */}
        <div className="mt-10 flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-white/70">Single sessions</div>
          <Toggle
            value={sessionToggle}
            onChange={setSessionToggle}
            options={[
              { value: 'personal_session', label: 'Personal' },
              { value: 'group_session', label: 'Group' },
            ]}
          />
        </div>
        <div className="mt-4 max-w-sm">
          <AnimatePresence mode="wait">
            <PlanCard
              key={sessionToggle}
              plan={PLANS[sessionToggle]}
              featured={sessionToggle === 'personal_session'}
              badge={sessionToggle === 'personal_session' ? { icon: <Zap size={11} fill="currentColor" />, label: 'You pick the date' } : null}
              delay={0.15}
              inView={inView}
            />
          </AnimatePresence>
        </div>

        {/* Row 2: subscriptions */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium text-white/70">Monthly subscriptions</div>
          <div className="flex flex-wrap gap-2">
            <Toggle
              value={monthlyToggle}
              onChange={setMonthlyToggle}
              options={[
                { value: 'personal_monthly', label: 'Personal' },
                { value: 'group_monthly', label: 'Group' },
              ]}
            />
            {monthlyToggle === 'personal_monthly' && (
              <Toggle
                value={billingToggle}
                onChange={setBillingToggle}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly', badge: '17% off' },
                ]}
              />
            )}
          </div>
        </div>
        <div className="mt-4 max-w-sm">
          <AnimatePresence mode="wait">
            {monthlyToggle === 'personal_monthly' ? (
              <PlanCard
                key={billingToggle + '_personal'}
                plan={personalSubPlan}
                featured
                badge={{ icon: <Star size={11} />, label: 'Most popular' }}
                delay={0.2}
                inView={inView}
              />
            ) : (
              <PlanCard key="group_monthly" plan={PLANS.group_monthly} delay={0.2} inView={inView} />
            )}
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-xs text-white/35">
          All sessions on Zoom · Spots are limited
        </p>
      </div>
    </section>
  );
}

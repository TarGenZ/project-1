import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Check, Users, User, Zap, Calendar, Star,
  ChevronRight, Lock, Ghost, Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PLANS, getGhostDealPrice } from '../../lib/plans';
import BookingModal from '../ui/BookingModal';
import './Pricing.css';

// ── Toggle pill ────────────────────────────────────────────
function Toggle({ options, value, onChange }) {
  return (
    <div className="billing-toggle">
      {options.map(o => (
        <button
          key={o.value}
          className={`toggle-btn ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.badge && <span className="toggle-badge">{o.badge}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Feature list ───────────────────────────────────────────
function FeatureList({ features, accent }) {
  return (
    <ul className="feature-list">
      {features.map(f => (
        <li key={f}>
          <Check size={14} className={`check-icon ${accent === 'amber' ? 'amber-check' : ''}`} />
          {f}
        </li>
      ))}
    </ul>
  );
}

// ── Plan card ──────────────────────────────────────────────
function PlanCard({ plan, featured, badge, onBook, delay, inView, ghostPrice }) {
  const isAmber = plan.accent === 'amber';
  const price = ghostPrice != null ? ghostPrice : plan.price;

  return (
    <motion.div
      className={`pricing-card ${featured ? 'featured' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      {badge && (
        <div className={`featured-badge ${isAmber ? 'badge-amber' : 'badge-violet'}`}>
          {badge.icon} {badge.label}
        </div>
      )}

      <div className="card-header">
        <div className={`card-icon-wrap ${plan.accent}`}>
          {plan.icon === 'users' ? <Users size={18} /> : <User size={18} />}
        </div>
        <div>
          <div className="card-type">{plan.name}</div>
          <div className="card-sub">{plan.tagline}</div>
        </div>
      </div>

      <div className="card-price">
        {plan.originalPrice && (
          <span className="price-original">₹{plan.originalPrice.toLocaleString('en-IN')}</span>
        )}
        {ghostPrice != null && (
          <span className="price-original">₹{plan.price.toLocaleString('en-IN')}</span>
        )}
        <span className={`price-amount ${isAmber ? 'amber-text' : ''}`}>
          ₹{price.toLocaleString('en-IN')}
        </span>
        <span className="price-period">
          /{plan.billing === 'monthly' ? 'mo' : plan.billing === 'yearly' ? 'yr' : 'session'}
        </span>
        {(plan.discountPct || (ghostPrice != null)) && (
          <span className="discount-badge">
            {plan.discountPct
              ? `${plan.discountPct}% off`
              : ghostPrice != null && plan.price > 0
                ? `${Math.round((1 - ghostPrice/PLANS.personal_monthly.price/5)*100)}% off`
                : ''}
          </span>
        )}
      </div>

      <FeatureList features={plan.features} accent={plan.accent} />

      <button className={`btn-card ${isAmber ? 'amber-btn' : ''}`} onClick={onBook}>
        Book {plan.name} — ₹{price.toLocaleString('en-IN')}
      </button>
    </motion.div>
  );
}

// ── Topper offer card ──────────────────────────────────────
function TopperCard({ inView, delay }) {
  const WHATSAPP = '919999999999';
  const msg = encodeURIComponent("Hi Arpan! I'm a topper and want to apply for the 80% off yearly plan. Here are my scores:");
  return (
    <motion.div
      className="pricing-card topper-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      <div className="featured-badge badge-gold">
        <Trophy size={12} /> Topper Offer
      </div>

      <div className="card-header">
        <div className="card-icon-wrap gold">
          <Star size={18} />
        </div>
        <div>
          <div className="card-type">Topper Yearly Plan</div>
          <div className="card-sub">80% off · score proof required</div>
        </div>
      </div>

      <div className="card-price">
        <span className="price-original">₹{PLANS.personal_yearly.price.toLocaleString('en-IN')}</span>
        <span className="price-amount gold-text">₹{Math.round(PLANS.personal_yearly.price * 0.2).toLocaleString('en-IN')}</span>
        <span className="price-period">/yr</span>
        <span className="discount-badge gold-badge">80% off</span>
      </div>

      <div className="topper-notice">
        <Lock size={14} />
        <div>
          <div className="tn-title">Proof of performance required</div>
          <div className="tn-desc">Send your mock test scores & rank screenshots. Arpan reviews and approves within 24 hours.</div>
        </div>
      </div>

      <ul className="feature-list">
        {PLANS.personal_yearly.features.map(f => (
          <li key={f}><Check size={14} className="check-icon gold-check" />{f}</li>
        ))}
      </ul>

      <a
        href={`https://wa.me/${WHATSAPP}?text=${msg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-card whatsapp-btn"
      >
        Apply via WhatsApp <ChevronRight size={15} />
      </a>
    </motion.div>
  );
}

// ── Ghost deal card ────────────────────────────────────────
function GhostCard({ ghostData, inView, delay, onBook }) {
  return (
    <motion.div
      className="pricing-card ghost-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      <div className="featured-badge badge-ghost">
        <Ghost size={12} /> Limited Deal · Ends soon
      </div>

      <div className="card-header">
        <div className="card-icon-wrap ghost-icon">
          <User size={18} />
        </div>
        <div>
          <div className="card-type">Year-End Personal Deal</div>
          <div className="card-sub">5 months for the price of less · ends {ghostData.monthName}</div>
        </div>
      </div>

      <div className="card-price">
        <span className="price-original">₹{ghostData.base.toLocaleString('en-IN')}</span>
        <span className="price-amount ghost-text">₹{ghostData.price.toLocaleString('en-IN')}</span>
        <span className="price-period">/deal</span>
        <span className="discount-badge ghost-badge">
          {ghostData.discountPct > 0 ? `${ghostData.discountPct}% extra off` : 'Launch price'}
        </span>
      </div>

      <div className="ghost-notice">
        Includes 5 months of personal weekly sessions (30 min/week). Price drops by 15% more each month — the earlier you grab it, the less you pay.
      </div>

      <ul className="feature-list">
        {PLANS.personal_monthly.features.map(f => (
          <li key={f}><Check size={14} className="check-icon ghost-check" />{f}</li>
        ))}
        <li><Check size={14} className="check-icon ghost-check" />5 months of sessions pre-paid</li>
        <li><Check size={14} className="check-icon ghost-check" />Choose your weekly day & slot</li>
      </ul>

      <button className="btn-card ghost-btn" onClick={onBook}>
        Grab deal — ₹{ghostData.price.toLocaleString('en-IN')}
      </button>
    </motion.div>
  );
}

// ── Main Pricing section ────────────────────────────────────
export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { user, openAuthModal } = useAuth();

  // Two separate toggles
  const [sessionToggle, setSessionToggle] = useState('personal_session'); // 'personal_session' | 'group_session'
  const [monthlyToggle, setMonthlyToggle] = useState('personal_monthly'); // 'personal_monthly' | 'group_monthly'
  const [billingToggle, setBillingToggle] = useState('monthly'); // 'monthly' | 'yearly'  (for personal monthly)

  // Ghost offer (Dec–May only) and topper toggle
  const [specialToggle, setSpecialToggle] = useState('ghost'); // 'ghost' | 'topper'

  const [activeModal, setActiveModal] = useState(null); // plan object or null

  const ghostData = getGhostDealPrice(); // null if not Dec–May
  const showSpecialSection = ghostData !== null; // only show if ghost deal is active

  function openModal(plan) {
    if (!user) { openAuthModal(); return; }
    setActiveModal(plan);
  }

  // Determine which monthly personal plan to show (monthly vs yearly)
  const personalSubPlan = billingToggle === 'yearly' ? PLANS.personal_yearly : PLANS.personal_monthly;

  return (
    <section className="pricing" id="pricing" ref={ref}>
      <div className="section-inner">
        <motion.div className="section-eyebrow" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          Pricing
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
          Invest in your rank.<br />
          <span className="grad-text">Not just another course.</span>
        </motion.h2>

        {/* ── Row 1: Single sessions ─────────────────── */}
        <motion.div className="pricing-row-header" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}>
          <div className="row-label">Single sessions</div>
          <Toggle
            value={sessionToggle}
            onChange={setSessionToggle}
            options={[
              { value: 'personal_session', label: 'Personal', badge: null },
              { value: 'group_session', label: 'Group', badge: null },
            ]}
          />
        </motion.div>

        <div className="pricing-grid single-grid">
          <AnimatePresence mode="wait">
            <PlanCard
              key={sessionToggle}
              plan={PLANS[sessionToggle]}
              featured={sessionToggle === 'personal_session'}
              badge={sessionToggle === 'personal_session' ? { icon: <Zap size={11} fill="currentColor" />, label: 'You pick the date' } : null}
              onBook={() => openModal(PLANS[sessionToggle])}
              delay={0.2}
              inView={inView}
            />
          </AnimatePresence>
        </div>

        {/* ── Row 2: Subscriptions ───────────────────── */}
        <motion.div className="pricing-row-header" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}>
          <div className="row-label">Monthly subscriptions</div>
          <div className="toggle-group">
            <Toggle
              value={monthlyToggle}
              onChange={setMonthlyToggle}
              options={[
                { value: 'personal_monthly', label: 'Personal', badge: null },
                { value: 'group_monthly', label: 'Group', badge: null },
              ]}
            />
            {monthlyToggle === 'personal_monthly' && (
              <Toggle
                value={billingToggle}
                onChange={setBillingToggle}
                options={[
                  { value: 'monthly', label: 'Monthly', badge: null },
                  { value: 'yearly', label: 'Yearly', badge: '17% off' },
                ]}
              />
            )}
          </div>
        </motion.div>

        <div className="pricing-grid single-grid">
          <AnimatePresence mode="wait">
            {monthlyToggle === 'personal_monthly' ? (
              <PlanCard
                key={billingToggle + '_personal'}
                plan={personalSubPlan}
                featured
                badge={{ icon: <Star size={11} />, label: 'Most popular' }}
                onBook={() => openModal(personalSubPlan)}
                delay={0.3}
                inView={inView}
              />
            ) : (
              <PlanCard
                key="group_monthly"
                plan={PLANS.group_monthly}
                onBook={() => openModal(PLANS.group_monthly)}
                delay={0.3}
                inView={inView}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Row 3: Special offers (Dec–May) ───────── */}
        {showSpecialSection && (
          <>
            <motion.div className="pricing-row-header special-row" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 }}>
              <div className="row-label special-label">
                <Ghost size={14} /> Special offers
              </div>
              <Toggle
                value={specialToggle}
                onChange={setSpecialToggle}
                options={[
                  { value: 'ghost', label: '🕯️ Year-end deal', badge: null },
                  { value: 'topper', label: '🏆 Topper offer', badge: null },
                ]}
              />
            </motion.div>

            <div className="pricing-grid single-grid">
              <AnimatePresence mode="wait">
                {specialToggle === 'ghost' ? (
                  <GhostCard
                    key="ghost"
                    ghostData={ghostData}
                    inView={inView}
                    delay={0.4}
                    onBook={() => openModal({
                      ...PLANS.personal_monthly,
                      key: 'ghost_deal',
                      name: 'Year-End Personal Deal',
                      price: ghostData.price,
                      billing: 'one_time',
                      scheduleType: 'pick_weekly',
                      isGhostDeal: true,
                    })}
                  />
                ) : (
                  <TopperCard key="topper" inView={inView} delay={0.4} />
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        <motion.p className="pricing-note" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          All sessions on Zoom · Secure payments via Razorpay · Spots are limited
        </motion.p>
      </div>

      {/* Booking modal */}
      {activeModal && (
        <BookingModal plan={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </section>
  );
}

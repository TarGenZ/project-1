import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, Users, ChevronLeft, ChevronRight,
  Check, Tag, AlertCircle, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePayment } from '../../hooks/usePayment';
import { useAuth } from '../../context/AuthContext';
import { getSlotsForPlan, DAYS } from '../../lib/plans';
import './BookingModal.css';

function fmt(date) { return date.toISOString().split('T')[0]; }
function displayDate(date) {
  return date.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

// Next 60 days, skip Sundays
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
}

// ── Promo code widget ─────────────────────────────────────
function PromoInput({ userId, originalPrice, onApply, onRemove, applied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function apply() {
    if (!code.trim()) return;
    setLoading(true); setError('');
    const res = await fetch('/api/validate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim(), user_id: userId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    const discounted = Math.round(originalPrice * (1 - data.discount_pct / 100));
    onApply({ codeId: data.code_id, code: code.toUpperCase().trim(), discountPct: data.discount_pct, finalPrice: discounted });
  }

  if (applied) {
    return (
      <div className="promo-applied">
        <Zap size={13} fill="currentColor" />
        <span><b>{applied.code}</b> — {applied.discountPct}% off applied</span>
        <button className="promo-remove" onClick={() => { onRemove(); setCode(''); setError(''); }}>
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="promo-wrap">
      <div className="promo-row">
        <div className="promo-field">
          <Tag size={14} className="promo-icon" />
          <input
            type="text"
            placeholder="Promo code"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && apply()}
          />
        </div>
        <button className="btn-promo-apply" onClick={apply} disabled={loading || !code.trim()}>
          {loading ? '…' : 'Apply'}
        </button>
      </div>
      {error && <div className="promo-error"><AlertCircle size={12}/>{error}</div>}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────
export default function BookingModal({ plan, onClose }) {
  const { user, openAuthModal } = useAuth();
  const { initiatePayment, finaliseBooking } = usePayment();

  const slots = getSlotsForPlan(plan.key);
  const isPickDate   = plan.scheduleType === 'pick_date';
  const isPickWeekly = plan.scheduleType === 'pick_weekly';
  const isAdminSets  = plan.scheduleType === 'admin_sets';

  const [step, setStep] = useState('schedule'); // 'schedule' | 'done'
  const [zoomInfo, setZoomInfo] = useState(null); // { joinUrl, password, startTime }
  const [selectedDate, setSelectedDate]   = useState(null);
  const [selectedSlot, setSelectedSlot]   = useState(null); // slot key e.g. '18:00'
  const [selectedDay, setSelectedDay]     = useState(null); // 1–6
  const [calPage, setCalPage]             = useState(0);
  const [blockedDates, setBlockedDates]   = useState([]); // full-day blocks
  const [takenSlots, setTakenSlots]       = useState([]); // {date, slot_key, day, slot_key}
  const [takenDays, setTakenDays]         = useState([]); // weekly days already taken per slot
  const [nextGroupSession, setNextGroupSession] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [promo, setPromo]                 = useState(null); // { codeId, code, discountPct, finalPrice }

  const availableDates = getAvailableDates();
  const DATES_PER_PAGE = 14;
  const pagedDates = availableDates.slice(calPage * DATES_PER_PAGE, (calPage+1)*DATES_PER_PAGE);

  const finalPrice = promo ? promo.finalPrice : plan.price;
  const isFree = finalPrice === 0;

  useEffect(() => {
    // Blocked full days
    supabase.from('blocked_slots').select('blocked_date,slot').then(({ data }) => {
      setBlockedDates((data || []).filter(b => !b.slot).map(b => b.blocked_date));
    });

    if (isPickDate) {
      // For personal_session: which dates have the single slot taken?
      supabase.from('purchases')
        .select('scheduled_date, scheduled_slot')
        .eq('plan_key', 'personal_session')
        .eq('status', 'paid')
        .then(({ data }) => setTakenSlots(data || []));
    }

    if (isPickWeekly) {
      // For monthly/yearly: which day+slot combos are already full?
      // Only 1 student per slot per day (you have 2 slots × 6 days = 12 max)
      supabase.from('purchases')
        .select('weekly_day, weekly_slot')
        .in('plan_key', ['personal_monthly','personal_yearly','ghost_deal'])
        .eq('status', 'paid')
        .then(({ data }) => setTakenDays(data || []));
    }

    if (isAdminSets) {
      supabase.from('group_sessions')
        .select('*')
        .eq('plan_key', plan.key)
        .gte('session_date', fmt(new Date()))
        .order('session_date', { ascending: true })
        .limit(1)
        .then(({ data }) => setNextGroupSession(data?.[0] || null));
    }
  }, [isPickDate, isPickWeekly, isAdminSets, plan.key]);

  // Is a full date blocked?
  function isDateBlocked(date) { return blockedDates.includes(fmt(date)); }

  // For personal_session: is this date+slot taken?
  function isDateSlotTaken(date, slotKey) {
    return takenSlots.some(t => t.scheduled_date === fmt(date) && t.scheduled_slot === slotKey);
  }

  // Is a date fully booked? (all its slots taken or blocked)
  function isDateFull(date) {
    return slots.every(s => isDateSlotTaken(date, s.key));
  }

  // For weekly: is this day+slot combo already taken by someone?
  function isDaySlotTaken(day, slotKey) {
    return takenDays.some(t => t.weekly_day === day && t.weekly_slot === slotKey);
  }

  // Available slots for selected date (pick_date)
  function availableSlotsForDate(date) {
    if (!date) return slots;
    return slots.filter(s => !isDateSlotTaken(date, s.key));
  }

  // Available slots for selected day (pick_weekly)
  function availableSlotsForDay(day) {
    if (day === null) return slots;
    return slots.filter(s => !isDaySlotTaken(day, s.key));
  }

  const canProceed = isAdminSets
    ? true
    : isPickDate
      ? selectedDate && selectedSlot
      : selectedDay !== null && selectedSlot;

  async function handlePay() {
    if (!user) { openAuthModal(); return; }
    setLoading(true);

    const bookingParams = {
      planKey: plan.key,
      planName: plan.name,
      amount: finalPrice,
      billingPeriod: plan.billing,
      scheduledDate: isPickDate ? fmt(selectedDate) : undefined,
      scheduledSlot: isPickDate ? selectedSlot : undefined,
      weeklyDay: isPickWeekly ? selectedDay : undefined,
      weeklySlot: isPickWeekly ? selectedSlot : undefined,
      isGhostDeal: plan.isGhostDeal || false,
      isTopperOffer: plan.isTopperOffer || false,
      promoCodeId: promo?.codeId || null,
      discountPct: promo?.discountPct || null,
    };

    // 100% discount — skip Razorpay, go straight to finaliseBooking
    if (isFree) {
      const result = await finaliseBooking({ ...bookingParams, amount: 0 });
      setLoading(false);
      if (result.success) {
        setZoomInfo({ joinUrl: result.zoomJoinUrl, password: result.zoomPassword, startTime: result.zoomStartTime });
        setStep('done');
      }
      return;
    }

    // Paid — Razorpay → verify → Zoom → save
    const result = await initiatePayment(bookingParams);
    setLoading(false);
    if (result?.success) {
      setZoomInfo({ joinUrl: result.zoomJoinUrl, password: result.zoomPassword, startTime: result.zoomStartTime });
      setStep('done');
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
        <motion.div
          className="modal-box"
          initial={{ scale:0.94, opacity:0, y:24 }}
          animate={{ scale:1, opacity:1, y:0 }}
          exit={{ scale:0.94, opacity:0 }}
          transition={{ duration:0.25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <div className="modal-plan-name">{plan.name}</div>
              <div className="modal-price-row">
                {promo && <span className="modal-price-original">₹{plan.price.toLocaleString('en-IN')}</span>}
                <span className={`modal-price ${promo ? 'discounted' : ''}`}>
                  {isFree ? 'FREE' : `₹${finalPrice.toLocaleString('en-IN')}`}
                </span>
                <span className="modal-billing">
                  /{plan.billing === 'monthly' ? 'mo' : plan.billing === 'yearly' ? 'yr' : 'session'}
                </span>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}><X size={20}/></button>
          </div>

          {step === 'done' ? <DoneState plan={plan} onClose={onClose} zoomInfo={zoomInfo} /> : (
            <>
              <div className="modal-body">
                {/* ── Admin sets ── */}
                {isAdminSets && (
                  <>
                    <div className="admin-schedules-notice">
                      <Users size={20}/>
                      <div>
                        <div className="asn-title">Arpan schedules this session</div>
                        <div className="asn-desc">
                          After payment, you'll be added and notified of the date and Zoom link via WhatsApp.
                        </div>
                      </div>
                    </div>
                    <div className="fixed-time-info">
                      <Clock size={13}/> Session time: <b>7:00 – 7:40 PM IST</b>
                    </div>
                    {nextGroupSession && (
                      <div className="next-session-info">
                        <Calendar size={14}/>
                        <span>Next session: <b>{new Date(nextGroupSession.session_date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</b></span>
                      </div>
                    )}
                  </>
                )}

                {/* ── Pick date (personal_session) ── */}
                {isPickDate && (
                  <>
                    <div className="fixed-time-info">
                      <Clock size={13}/> Your session time: <b>10:00 – 10:30 PM IST</b>
                    </div>
                    <div className="cal-section">
                      <div className="cal-header">
                        <span className="cal-label"><Calendar size={14}/> Pick a date</span>
                        <div className="cal-nav">
                          <button onClick={() => setCalPage(p => Math.max(0,p-1))} disabled={calPage===0}><ChevronLeft size={16}/></button>
                          <button onClick={() => setCalPage(p => p+1)} disabled={(calPage+1)*DATES_PER_PAGE >= availableDates.length}><ChevronRight size={16}/></button>
                        </div>
                      </div>
                      <div className="date-grid">
                        {pagedDates.map(d => {
                          const blocked = isDateBlocked(d) || isDateFull(d);
                          const sel = selectedDate && fmt(d) === fmt(selectedDate);
                          return (
                            <button
                              key={fmt(d)}
                              className={`date-btn ${sel?'selected':''} ${blocked?'blocked':''}`}
                              disabled={blocked}
                              onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                            >
                              <span className="date-day">{d.toLocaleDateString('en-IN',{weekday:'short'})}</span>
                              <span className="date-num">{d.getDate()}</span>
                              <span className="date-mon">{d.toLocaleDateString('en-IN',{month:'short'})}</span>
                              {blocked && <span className="date-full-tag">Full</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Single slot — auto-select since only one option */}
                    {selectedDate && (
                      <div className="slot-section">
                        <div className="slot-label"><Clock size={14}/> Session slot</div>
                        {availableSlotsForDate(selectedDate).length === 0 ? (
                          <div className="slots-full">This date is fully booked. Please pick another.</div>
                        ) : (
                          <div className="slot-grid">
                            {availableSlotsForDate(selectedDate).map(s => (
                              <button
                                key={s.key}
                                className={`slot-btn ${selectedSlot===s.key?'selected':''}`}
                                onClick={() => setSelectedSlot(s.key)}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── Pick weekly (monthly/yearly) ── */}
                {isPickWeekly && (
                  <>
                    <div className="fixed-time-info">
                      <Clock size={13}/> Available times: <b>9:00–9:30 PM</b> or <b>9:30–10:00 PM IST</b>
                    </div>
                    <div className="cal-section">
                      <div className="slot-label"><Calendar size={14}/> Pick your weekly session day</div>
                      <div className="day-grid">
                        {[1,2,3,4,5,6].map(d => {
                          const allTaken = slots.every(s => isDaySlotTaken(d, s.key));
                          const someTaken = slots.some(s => isDaySlotTaken(d, s.key));
                          return (
                            <button
                              key={d}
                              className={`day-btn ${selectedDay===d?'selected':''} ${allTaken?'blocked':''} ${someTaken&&!allTaken?'partial':''}`}
                              disabled={allTaken}
                              onClick={() => { setSelectedDay(d); setSelectedSlot(null); }}
                            >
                              {DAYS[d].slice(0,3)}
                              {allTaken && <span className="day-full">Full</span>}
                              {someTaken && !allTaken && <span className="day-partial">1 left</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {selectedDay !== null && (
                      <div className="slot-section">
                        <div className="slot-label"><Clock size={14}/> Pick your time slot</div>
                        <div className="slot-grid">
                          {slots.map(s => {
                            const taken = isDaySlotTaken(selectedDay, s.key);
                            return (
                              <button
                                key={s.key}
                                className={`slot-btn ${selectedSlot===s.key?'selected':''} ${taken?'taken':''}`}
                                disabled={taken}
                                onClick={() => !taken && setSelectedSlot(s.key)}
                              >
                                {s.label}
                                {taken && <span className="slot-taken-tag">Booked</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── Promo code (always shown) ── */}
                <div className="promo-section">
                  <PromoInput
                    userId={user?.id}
                    originalPrice={plan.price}
                    applied={promo}
                    onApply={setPromo}
                    onRemove={() => setPromo(null)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                {canProceed && (
                  <div className="booking-summary">
                    {isPickDate && selectedDate && <><Calendar size={13}/> {displayDate(selectedDate)} · 10:00–10:30 PM</>}
                    {isPickWeekly && selectedDay !== null && selectedSlot && (
                      <><Calendar size={13}/> Every {DAYS[selectedDay]} · {slots.find(s=>s.key===selectedSlot)?.label}</>
                    )}
                    {isAdminSets && <><Users size={13}/> Arpan will schedule and notify you</>}
                    {promo && <span className="summary-discount"> · {promo.discountPct}% off</span>}
                  </div>
                )}
                <button
                  className={`btn-pay ${isFree?'free-btn':''} ${!canProceed?'disabled':''}`}
                  disabled={!canProceed || loading}
                  onClick={handlePay}
                >
                  {loading
                    ? 'Processing…'
                    : isFree
                      ? 'Book for FREE →'
                      : `Pay ₹${finalPrice.toLocaleString('en-IN')} via Razorpay`}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DoneState({ plan, onClose, zoomInfo }) {
  const hasZoom = zoomInfo?.joinUrl;

  const formatStartTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    }) + ' IST';
  };

  return (
    <div className="done-state">
      <div className="done-icon"><Check size={28}/></div>
      <h3>You're booked! 🎉</h3>
      <p>Payment confirmed for <b>{plan.name}</b>. Your session is scheduled.</p>

      {hasZoom ? (
        <div className="zoom-card">
          <div className="zoom-card-header">
            <ZoomIcon />
            <span>Your Zoom meeting is ready</span>
          </div>
          {zoomInfo.startTime && (
            <div className="zoom-detail">
              📅 {formatStartTime(zoomInfo.startTime)}
            </div>
          )}
          {zoomInfo.password && (
            <div className="zoom-detail">
              🔑 Password: <code>{zoomInfo.password}</code>
            </div>
          )}
          <a
            href={zoomInfo.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-zoom-join"
          >
            Join Zoom Meeting →
          </a>
          <p className="zoom-note">This link is also saved in your dashboard.</p>
        </div>
      ) : (
        <div className="zoom-pending">
          <div className="zoom-pending-icon">🔗</div>
          <p>Zoom link will be shared via WhatsApp before your session.</p>
        </div>
      )}

      <div className="done-actions">
        <a href="/dashboard" className="btn-dashboard">Go to Dashboard</a>
        <button className="btn-close-done" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function ZoomIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2D8CFF" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      <path d="M15.5 9.5l3-2v9l-3-2V9.5z" fill="#2D8CFF"/>
      <rect x="6" y="8" width="8" height="8" rx="1.5" fill="#2D8CFF"/>
      <path d="M14 9.5l4-2.5v10L14 14.5V9.5z" fill="#1a6fd6"/>
    </svg>
  );
}

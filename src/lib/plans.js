// ─── Slot definitions (fixed — no student choice) ────────────
// personal_session (one-time):     10:00–10:30 PM → one slot per day
// personal_monthly/yearly/ghost:   9:00–9:30 PM  OR  9:30–10:00 PM → 2 slots per day (first-come)
// group (all):                     7:00–7:40 PM  → admin sets date, no slot choice

export const FIXED_SLOTS = {
  // key → { label, start, end }
  personal_session: [
    { key: '22:00', label: '10:00 – 10:30 PM', start: '22:00', end: '22:30' },
  ],
  personal_weekly: [
    { key: '21:00', label: '9:00 – 9:30 PM', start: '21:00', end: '21:30' },
    { key: '21:30', label: '9:30 – 10:00 PM', start: '21:30', end: '22:00' },
  ],
  group: [
    { key: '19:00', label: '7:00 – 7:40 PM', start: '19:00', end: '19:40' },
  ],
};

// Which slot group does a plan use, based on its schedule_type (from the
// shared `plans` table) rather than a hardcoded plan_key — plan_keys are
// created dynamically by admins now (e.g. free sessions), so anything
// keyed off a fixed plan_key list would silently break for new plans.
export function getSlotsForScheduleType(scheduleType) {
  if (scheduleType === 'pick_date') return FIXED_SLOTS.personal_session;
  if (scheduleType === 'pick_weekly') return FIXED_SLOTS.personal_weekly;
  return FIXED_SLOTS.group; // admin_sets
}

export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Ghost deal pricing: starts Dec 1, drops 15% each month, hides after May
export function getGhostDealPrice() {
  const now = new Date();
  const month = now.getMonth();
  const BASE = Math.round(999 * 5 * 0.80); // ₹3,996
  const DROP_PER_MONTH = 0.15;
  const monthOffset = { 11: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
  if (!(month in monthOffset)) return null;
  const discount = monthOffset[month] * DROP_PER_MONTH;
  const price = Math.round(BASE * (1 - discount));
  const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month];
  const discountPct = Math.round(discount * 100);
  return { price, discountPct, monthName, base: BASE };
}

export const PLANS = {
  personal_session: {
    key: 'personal_session',
    name: 'Personal Session',
    price: 499,
    billing: 'one_time',
    tagline: 'One-time 1-on-1 · 10:00–10:30 PM · you pick the date',
    features: [
      'You choose any available date',
      '30-min 1-on-1 Zoom (10:00–10:30 PM)',
      'Personalised strategy & doubt-clearing',
      'WhatsApp follow-up after session',
      'Session recording shared post-call',
    ],
    scheduleType: 'pick_date',
    icon: 'user', accent: 'amber',
  },
  group_session: {
    key: 'group_session',
    name: 'Group Session',
    price: 199,
    billing: 'one_time',
    tagline: 'One-time shared session · Arpan sets the date & time',
    features: [
      'Arpan schedules the exact date and time',
      '40-min group Zoom session',
      'Batch Q&A and strategy discussion',
      'WhatsApp group access',
      'Session recording shared',
    ],
    scheduleType: 'admin_sets',
    icon: 'users', accent: 'violet',
  },
  personal_monthly: {
    key: 'personal_monthly',
    name: 'Personal Monthly',
    price: 999,
    billing: 'monthly',
    tagline: '4 sessions/mo · 9:00 or 9:30 PM · you pick the day',
    features: [
      'Pick your day of week (Mon–Sat)',
      '30-min 1-on-1 Zoom every week',
      'Slots: 9:00–9:30 PM or 9:30–10:00 PM',
      'Personalised monthly roadmap',
      'Direct WhatsApp access',
      'Mock test analysis each session',
    ],
    scheduleType: 'pick_weekly',
    icon: 'user', accent: 'amber',
  },
  personal_yearly: {
    key: 'personal_yearly',
    name: 'Personal Yearly',
    price: 9999,
    billing: 'yearly',
    originalPrice: 999 * 12,
    discountPct: 17,
    tagline: '52 sessions · 9:00 or 9:30 PM · save 17%',
    features: [
      'Everything in Monthly plan',
      '52 sessions over the full year',
      'Save ₹989 vs monthly billing',
      'Priority slot selection',
      'Yearly progress review with Arpan',
      'First access to new resources',
    ],
    scheduleType: 'pick_weekly',
    icon: 'user', accent: 'amber',
  },
  group_monthly: {
    key: 'group_monthly',
    name: 'Group Monthly',
    price: 399,
    billing: 'monthly',
    tagline: 'Weekly cohort · Sundays 7:00–7:40 PM · starts at 20 students',
    features: [
      'Every Sunday, 7:00–7:40 PM group Zoom',
      'Starts running once 20 students have joined',
      'Shared batch strategy sessions',
      'WhatsApp group community',
      'Recorded sessions for replay',
      'Monthly mock discussion',
    ],
    scheduleType: 'admin_sets',
    icon: 'users', accent: 'violet',
  },
};

// Flat slot label map for Dashboard display (keyed by slot key).
// Current slots first, then legacy keys kept ONLY so bookings made before
// this timing change still show a readable label instead of a raw "18:00".
export const SLOT_LABELS = {
  // current
  '22:00': '10:00 – 10:30 PM',
  '21:00': '9:00 – 9:30 PM',
  '21:30': '9:30 – 10:00 PM',
  '19:00': '7:00 – 7:40 PM',
  // legacy (pre-timing-change) — display only, no longer offered
  '19:45': '7:45 – 8:15 PM',
  '18:00': '6:00 – 6:30 PM',
  '18:30': '6:30 – 7:00 PM',
};

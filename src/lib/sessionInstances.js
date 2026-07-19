import { DAYS, SLOT_LABELS } from './plans';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a, b) {
  return a.getTime() === b.getTime();
}

// Nearest occurrence of `weekday` (0=Sun..6=Sat) on or after `from`.
function nextWeekdayOccurrence(weekday, from) {
  const d = startOfDay(from);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Turns paid purchases (+ any group_sessions rows for group plans the user
 * has) into individual "session instances", then buckets each into past /
 * today / upcoming by date.
 *
 * Purchases with no schedule yet (schedule_type: pick_date/pick_weekly
 * awaiting a date/slot pick) are intentionally excluded here — those are
 * surfaced separately as "complete your booking" prompts, since they aren't
 * a session yet.
 *
 * group_sessions isn't linked to a specific purchase row (one batch serves
 * everyone who bought that plan_key), so every group_sessions row matching
 * a plan_key the user has paid for is shown as their own instance — that's
 * the best fidelity the current data model supports.
 *
 * @param {Array} purchases
 * @param {Array} groupSessions
 * @param {Record<string, {schedule_type: string}>} plansByKey - from the shared `plans` table
 * @returns {{past: Array, today: Array, upcoming: Array}}
 */
export function buildSessionInstances(purchases, groupSessions, plansByKey = {}) {
  const today = startOfDay(new Date());
  const instances = [];

  for (const p of purchases) {
    if (p.status !== 'paid') continue;

    if (p.scheduled_date) {
      instances.push({
        id: `${p.id}-date`,
        purchaseId: p.id,
        label: p.plan_name,
        date: startOfDay(p.scheduled_date),
        slotLabel: SLOT_LABELS[p.scheduled_slot] || p.scheduled_slot,
        zoomJoinUrl: p.zoom_join_url,
      });
    } else if (p.weekly_day !== null && p.weekly_day !== undefined && p.weekly_slot) {
      const expired = p.valid_till && startOfDay(p.valid_till) < today;
      if (expired) {
        instances.push({
          id: `${p.id}-weekly-expired`,
          purchaseId: p.id,
          label: `${p.plan_name} — plan ended`,
          date: startOfDay(p.valid_till),
          slotLabel: SLOT_LABELS[p.weekly_slot] || p.weekly_slot,
          forcePast: true,
        });
      } else {
        instances.push({
          id: `${p.id}-weekly`,
          purchaseId: p.id,
          label: `${p.plan_name} (every ${DAYS[p.weekly_day]})`,
          date: nextWeekdayOccurrence(p.weekly_day, today),
          slotLabel: SLOT_LABELS[p.weekly_slot] || p.weekly_slot,
          zoomJoinUrl: p.zoom_join_url,
          recurring: true,
        });
      }
    }
  }

  const groupPlanKeys = new Set(
    purchases
      .filter((p) => p.status === 'paid' && plansByKey[p.plan_key]?.schedule_type === 'admin_sets')
      .map((p) => p.plan_key)
  );
  for (const gs of groupSessions || []) {
    if (!groupPlanKeys.has(gs.plan_key)) continue;
    instances.push({
      id: `gs-${gs.id}`,
      label: plansByKey[gs.plan_key]?.name || 'Group Session',
      date: startOfDay(gs.session_date),
      slotLabel: SLOT_LABELS[gs.session_slot] || gs.session_slot,
      zoomJoinUrl: gs.zoom_link,
      isGroup: true,
    });
  }

  const past = [];
  const todayList = [];
  const upcoming = [];

  for (const inst of instances) {
    if (inst.forcePast || inst.date < today) past.push(inst);
    else if (sameDay(inst.date, today)) todayList.push(inst);
    else upcoming.push(inst);
  }

  past.sort((a, b) => b.date - a.date);
  todayList.sort((a, b) => (a.slotLabel || '').localeCompare(b.slotLabel || ''));
  upcoming.sort((a, b) => a.date - b.date);

  return { past, today: todayList, upcoming };
}

// POST /api/create-zoom-meeting  (Netlify Function, routed via config.path)
// Body: { purchase_id, scheduled_date?, scheduled_slot?, weekly_day?, weekly_slot? }
//
// This is what CompleteBookingModal.jsx calls when a student finalises the
// date/time for a plan they've already paid for. It replaces what used to
// be a direct client-side `supabase.from('purchases').update(...)` call —
// moved server-side because creating the Zoom meeting needs the Zoom app
// secret (never exposed to the browser), and because this is now the one
// place that actually writes zoom_meeting_id/zoom_join_url/zoom_password,
// which shouldn't be client-writable.
//
// Re-validates blocked slots and slot conflicts server-side even though
// CompleteBookingModal already checks them client-side for UX — a direct
// API call (or a race between two tabs) shouldn't be able to double-book
// a slot just because it skipped the client-side check.

import { createClient } from '@supabase/supabase-js';
import { createZoomMeeting, deleteZoomMeeting } from './_lib/zoom.js';
import { FIXED_SLOTS } from '../../src/lib/plans.js';

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
    if (!token) return json({ error: 'Not signed in.' }, 401);

    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid session — please sign in again.' }, 401);

    const body = await req.json().catch(() => ({}));
    const { purchase_id, scheduled_date, scheduled_slot, weekly_day, weekly_slot } = body;
    if (!purchase_id) return json({ error: 'Missing purchase_id.' }, 400);

    const { data: purchase, error: purchaseErr } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('id', purchase_id)
      .single();
    if (purchaseErr || !purchase) return json({ error: 'Purchase not found.' }, 404);
    if (purchase.user_id !== user.id) return json({ error: 'This purchase does not belong to you.' }, 403);
    if (purchase.status !== 'paid') return json({ error: 'This purchase has not been paid for yet.' }, 400);
    if (purchase.product !== 'mentorship') {
      return json({ error: 'Only mentorship purchases can be scheduled.' }, 400);
    }

    const { data: plan, error: planErr } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('plan_key', purchase.plan_key)
      .single();
    if (planErr || !plan) return json({ error: 'Plan not found.' }, 404);

    const isPickDate = plan.schedule_type === 'pick_date';
    const isPickWeekly = plan.schedule_type === 'pick_weekly';
    if (!isPickDate && !isPickWeekly) {
      return json({ error: 'This plan is scheduled by the admin, not self-service.' }, 400);
    }

    const slotList = isPickDate ? FIXED_SLOTS.personal_session : FIXED_SLOTS.personal_weekly;

    let start, end, topic;
    if (isPickDate) {
      if (!scheduled_date || !scheduled_slot) return json({ error: 'Pick a date and slot.' }, 400);
      const slot = slotList.find((s) => s.key === scheduled_slot);
      if (!slot) return json({ error: 'Invalid slot.' }, 400);

      const { data: blocked } = await supabaseAdmin
        .from('blocked_slots')
        .select('id')
        .eq('blocked_date', scheduled_date)
        .or(`slot.is.null,slot.eq.${scheduled_slot}`)
        .limit(1);
      if (blocked?.length) return json({ error: 'That date is blocked. Pick another.' }, 409);

      const { data: siblingKeys } = await supabaseAdmin.from('plans').select('plan_key').eq('schedule_type', 'pick_date');
      const { data: taken } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .in('plan_key', (siblingKeys || []).map((p) => p.plan_key))
        .eq('status', 'paid')
        .eq('scheduled_date', scheduled_date)
        .eq('scheduled_slot', scheduled_slot)
        .neq('id', purchase.id);
      if (taken?.length) return json({ error: 'That slot was just taken. Pick another.' }, 409);

      start = new Date(`${scheduled_date}T${slot.start}:00+05:30`);
      end = new Date(`${scheduled_date}T${slot.end}:00+05:30`);
      topic = `${purchase.plan_name} — ${user.email}`;
    } else {
      if (weekly_day === undefined || weekly_day === null || !weekly_slot) {
        return json({ error: 'Pick a weekly day and slot.' }, 400);
      }
      const slot = slotList.find((s) => s.key === weekly_slot);
      if (!slot || weekly_day < 0 || weekly_day > 6) return json({ error: 'Invalid day/slot.' }, 400);

      const { data: siblingKeys } = await supabaseAdmin.from('plans').select('plan_key').eq('schedule_type', 'pick_weekly');
      const { data: taken } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .in('plan_key', (siblingKeys || []).map((p) => p.plan_key))
        .eq('status', 'paid')
        .eq('weekly_day', weekly_day)
        .eq('weekly_slot', weekly_slot)
        .neq('id', purchase.id);
      if (taken?.length) return json({ error: 'That day/slot was just taken. Pick another.' }, 409);

      // First real occurrence of that weekday, for the recurring meeting's
      // anchor start_time (Zoom needs a concrete first instance).
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = (weekly_day - today.getDay() + 7) % 7 || 7;
      const firstOccurrence = new Date(today);
      firstOccurrence.setDate(today.getDate() + diff);
      const dateStr = firstOccurrence.toISOString().slice(0, 10);

      start = new Date(`${dateStr}T${slot.start}:00+05:30`);
      end = new Date(`${dateStr}T${slot.end}:00+05:30`);
      topic = `${purchase.plan_name} — ${user.email}`;
    }

    const durationMinutes = Math.round((end - start) / 60000);

    // Reschedule: drop the old meeting first so the host's Zoom account
    // doesn't accumulate orphaned meetings every time someone changes slot.
    if (purchase.zoom_meeting_id) {
      await deleteZoomMeeting(purchase.zoom_meeting_id).catch(() => {});
    }

    const meeting = await createZoomMeeting({
      topic,
      startTime: start,
      durationMinutes,
      agenda: `NEET mentorship session for ${purchase.plan_name}, booked via arpansarkar.org.`,
      weekly: isPickWeekly
        ? { zoomDay: weekly_day + 1, endDateTime: purchase.valid_till ? new Date(purchase.valid_till) : undefined }
        : null,
    });

    const update = isPickDate
      ? { scheduled_date, scheduled_slot }
      : { weekly_day, weekly_slot };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('purchases')
      .update({
        ...update,
        zoom_meeting_id: meeting.id,
        zoom_join_url: meeting.join_url,
        zoom_password: meeting.password,
        zoom_start_time: meeting.start_time,
      })
      .eq('id', purchase.id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    return json(updated);
  } catch (err) {
    console.error('[create-zoom-meeting] failed:', err);
    return json({ error: err.message?.startsWith('Zoom') ? err.message : 'Could not schedule the session. Please try again.' }, 500);
  }
};

export const config = { path: '/api/create-zoom-meeting' };

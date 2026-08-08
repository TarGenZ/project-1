// Zoom Server-to-Server OAuth helper. This is the "app credential" flow —
// no per-user Zoom login, no redirect/consent screen. Every meeting gets
// created under the one Zoom account these credentials belong to (Arpan's
// licensed Zoom account), which is exactly what a mentorship business
// needs: the admin is the host of every session.
//
// Setup (one-time, in the Zoom App Marketplace — marketplace.zoom.us):
//   1. "Develop" → "Build App" → "Server-to-Server OAuth".
//   2. Copy the generated Account ID, Client ID, and Client Secret into
//      these three environment variables (Netlify site settings → env vars):
//        ZOOM_ACCOUNT_ID
//        ZOOM_CLIENT_ID
//        ZOOM_CLIENT_SECRET
//   3. Under "Scopes", add: meeting:write:admin (or meeting:write if
//      scheduling only under your own user), meeting:read:admin.
//   4. Activate the app. No redirect URI or consent screen needed.
//   5. Optional: set ZOOM_USER_ID to the Zoom account's email if you want
//      to be explicit — defaults to "me" (the credential owner), which is
//      correct for a single-host setup like this one.
//
// Duplicated into project-0/netlify/functions/_lib/zoom.js verbatim — see
// that copy's note on why (the "no centralized API" per-project pattern
// this ecosystem already uses for Razorpay).

const TOKEN_URL = 'https://zoom.us/oauth/token';
const API_BASE = 'https://api.zoom.us/v2';

let cachedToken = null; // { token, expiresAt } — reused across warm invocations

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error('Zoom credentials are not configured (ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET).');
  }

  const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${TOKEN_URL}?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Zoom OAuth token request failed: ${data.reason || data.message || res.status}`);
  }

  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

/**
 * Creates a Zoom meeting.
 * @param {{ topic: string, startTime: Date, durationMinutes: number, agenda?: string, weekly?: { zoomDay: number, endDateTime?: Date } }} opts
 *   Pass `weekly` for a personal_weekly plan — creates ONE recurring Zoom
 *   meeting (same link every week) instead of a one-off, so the student's
 *   join link never changes week to week. `zoomDay` is Zoom's 1–7 (Sun=1)
 *   day code. `endDateTime`, if given, caps the recurrence (e.g. to the
 *   purchase's valid_till) — otherwise it recurs indefinitely until deleted.
 * @returns {Promise<{ id: string, join_url: string, password: string, start_time: string }>}
 */
export async function createZoomMeeting({ topic, startTime, durationMinutes, agenda = '', weekly = null }) {
  const token = await getAccessToken();
  const userId = process.env.ZOOM_USER_ID || 'me';

  const body = {
    topic,
    type: weekly ? 8 : 2, // 8 = recurring meeting with fixed time, 2 = one-off scheduled
    start_time: startTime.toISOString(),
    duration: durationMinutes,
    timezone: 'Asia/Kolkata',
    agenda,
    settings: {
      join_before_host: true,
      waiting_room: false,
      approval_type: 2, // no registration required
      audio: 'both',
      auto_recording: 'none',
    },
  };
  if (weekly) {
    body.recurrence = {
      type: 2, // weekly
      repeat_interval: 1,
      weekly_days: String(weekly.zoomDay),
      ...(weekly.endDateTime ? { end_date_time: weekly.endDateTime.toISOString() } : { end_times: 200 }),
    };
  }

  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/meetings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Zoom meeting creation failed: ${data.message || res.status}`);
  }

  return {
    id: String(data.id),
    join_url: data.join_url,
    password: data.password || '',
    start_time: data.start_time,
  };
}

/** Deletes a Zoom meeting — used when a student reschedules, so the old
 * meeting doesn't sit orphaned on the host's Zoom account. Swallows
 * "already gone" errors since that's a harmless race, not a real failure. */
export async function deleteZoomMeeting(meetingId) {
  if (!meetingId) return;
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    const data = await res.json().catch(() => ({}));
    console.warn('[zoom] failed to delete old meeting', meetingId, data.message || res.status);
  }
}

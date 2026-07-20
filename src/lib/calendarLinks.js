// Small, dependency-free helpers for "add this session to your calendar."
// No Google Calendar OAuth/API integration here on purpose — that would
// need a separate consent flow per user (admin AND every student) just to
// write one event. Instead we generate the same two links Zoom's own
// meeting page offers: a prefilled Google Calendar "create event" URL
// (opens in a new tab, one click to save) and a downloadable .ics file
// (works with Google/Outlook/Apple Calendar — the universal fallback).
// Duplicated verbatim into project-1/src/lib/ — see that copy's header.

function toGCalDate(date) {
  // Google Calendar wants UTC, formatted as YYYYMMDDTHHMMSSZ.
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * @param {{ title: string, description?: string, location?: string, start: Date, end: Date }} event
 */
export function googleCalendarUrl({ title, description = '', location = '', start, end }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function icsEscape(s = '') {
  return String(s).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

/**
 * Builds a minimal single-event .ics file (as a string) and triggers a
 * browser download. Works for both the admin dashboard and student app —
 * no server round-trip needed.
 */
export function downloadICS({ title, description = '', location = '', start, end }) {
  const uid = `${start.getTime()}-${Math.random().toString(36).slice(2)}@arpansarkar.org`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//arpansarkar.org//Sessions//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'session'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

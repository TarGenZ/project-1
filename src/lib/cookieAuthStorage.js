// Cross-subdomain SSO storage adapter for Supabase Auth.
//
// WHY THIS FILE EXISTS: supabase-js persists sessions to `localStorage` by
// default. localStorage is scoped per-origin, and `arpansarkar.org` /
// `mentorship.arpansarkar.org` / any future `project-N.arpansarkar.org` are
// all different origins — so plain localStorage can NEVER give "sign in
// once on the homepage, land already-signed-in on every other app", no
// matter what storageKey string is used. That behavior (the actual ask:
// "auto signin like google webapps do") requires a storage medium the
// browser shares across subdomains, which means cookies scoped to
// `.arpansarkar.org` (leading dot = "this cookie and all subdomains").
//
// This adapter is a drop-in replacement for localStorage that
// @supabase/supabase-js accepts via the `storage` client option. Once every
// subdomain app uses this (same as they already share storageKey and the
// whole src/auth/ folder verbatim), a session created on any one of them is
// automatically visible on all the others on next load/navigation — no
// redirect dance, no shared iframe, no extra backend call.
//
// Copy this file as-is into any new subdomain app, same as shared-auth.js —
// do not fork the logic.

const isProd =
  typeof window !== 'undefined' && window.location.hostname.endsWith('arpansarkar.org');

// Leading dot makes the cookie visible to arpansarkar.org AND every
// subdomain (mentorship.arpansarkar.org, project-2.arpansarkar.org, ...).
// Left undefined on localhost/preview so local dev isn't forced onto a
// domain it isn't running on.
const COOKIE_DOMAIN = isProd ? '.arpansarkar.org' : undefined;

// Real-world limit is ~4096 bytes per cookie (name+value+attributes
// combined). Stay well under that so the attributes (Domain, Path,
// SameSite, Secure, expires) never push a chunk over the edge.
const MAX_CHUNK_LEN = 3500;

// Supabase sessions (access + refresh token + user object) are usually
// 1-2 chunks. This is a hard ceiling so a corrupted/huge value can't spray
// dozens of cookies.
const MAX_CHUNKS = 6;

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  if (COOKIE_DOMAIN) cookie += `; Domain=${COOKIE_DOMAIN}`;
  if (isProd) cookie += '; Secure';
  document.cookie = cookie;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  if (COOKIE_DOMAIN) cookie += `; Domain=${COOKIE_DOMAIN}`;
  document.cookie = cookie;
}

// Supabase's serialized session can exceed a single cookie's size budget,
// so long values are split across numbered chunk cookies (`key.0`,
// `key.1`, ...) with a `key.count` header cookie, and reassembled on read.
export const cookieAuthStorage = {
  getItem(key) {
    const count = parseInt(getCookie(`${key}.count`) || '0', 10);
    if (!count) return getCookie(key); // short value, single cookie
    let value = '';
    for (let i = 0; i < count; i++) {
      const part = getCookie(`${key}.${i}`);
      if (part === null) return null; // a chunk went missing — treat as no session
      value += part;
    }
    return value;
  },

  setItem(key, value) {
    // Clear any previous representation first so a shorter value overwriting
    // a longer chunked one can't leave stale chunk cookies behind.
    cookieAuthStorage.removeItem(key);

    if (value.length <= MAX_CHUNK_LEN) {
      setCookie(key, value);
      return;
    }

    const chunks = [];
    for (let i = 0; i < value.length && chunks.length < MAX_CHUNKS; i += MAX_CHUNK_LEN) {
      chunks.push(value.slice(i, i + MAX_CHUNK_LEN));
    }
    setCookie(`${key}.count`, String(chunks.length));
    chunks.forEach((chunk, i) => setCookie(`${key}.${i}`, chunk));
  },

  removeItem(key) {
    const count = parseInt(getCookie(`${key}.count`) || '0', 10);
    deleteCookie(key);
    deleteCookie(`${key}.count`);
    for (let i = 0; i < count; i++) deleteCookie(`${key}.${i}`);
  },
};

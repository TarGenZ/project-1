import { createClient } from '@supabase/supabase-js';
import { cookieAuthStorage } from './cookieAuthStorage';

// Cross-subdomain SSO relies on three things matching exactly across every
// app on *.arpansarkar.org: the storageKey, the storage adapter
// (cookieAuthStorage.js — copied verbatim into every subdomain app, same as
// the whole src/auth/ folder), and the cookie domain it writes to
// (`.arpansarkar.org`, computed inside that file). Do not change any of
// these without updating every subdomain, or a session created on one app
// will stop being visible on the others.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in dev rather than silently breaking auth later.
  console.error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Check your .env file against .env.example.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'arpansarkar-auth', // exact string — shared across every subdomain app
    storage: cookieAuthStorage, // cookie-backed, not localStorage — see cookieAuthStorage.js
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // required for the OAuth callback flow
  },
});

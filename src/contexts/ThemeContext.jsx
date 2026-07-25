import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Shared theme context ───────────────────────────────────────────────────────
// Priority on mount:
//   1. Cookie  → instant, zero-flash render on every page load
//   2. Profile → cross-device sync for logged-in users (async, overrides cookie)
//   3. prefers-color-scheme → fallback for brand-new visitors
//
// On toggle (user-initiated):
//   • Shows a 500 ms blurred overlay ("Refreshing…") before swapping the theme
//   • Writes cookie (domain: .arpansarkar.org) so every subdomain picks it up
//   • Broadcasts via BroadcastChannel → instant same-browser cross-tab sync
//   • Saves to profiles.theme_preference → cross-device persistence
//
// Cross-device live sync:
//   • Supabase Realtime subscription on the profile row keeps all logged-in
//     devices in sync the moment another device toggles — no reload needed.
// ─────────────────────────────────────────────────────────────────────────────

const COOKIE   = 'arpansarkar-theme';
const CHANNEL  = 'arpansarkar-theme-sync';
const FALLBACK = 'dark';

// Transition timing (ms)
const T_BLUR_IN   = 160;  // overlay fade-in duration  (framer handles this)
const T_HOLD      = 260;  // how long we wait before actually swapping the theme
const T_AFTER     = 120;  // brief pause after swap before fade-out starts
// Total perceived delay ≈ T_HOLD + T_AFTER + T_BLUR_IN exit ≈ 540 ms

const ThemeCtx = createContext({ theme: FALLBACK, isDark: true, toggle: () => {} });

// ── helpers ───────────────────────────────────────────────────────────────────
function readCookie() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? m[1] : null;
}

function writeCookie(value) {
  const age = 60 * 60 * 24 * 365;
  document.cookie =
    `${COOKIE}=${value}; path=/; domain=.arpansarkar.org; max-age=${age}; SameSite=Lax`;
}

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value);
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, _setTheme] = useState(() => {
    const initial = readCookie() || systemTheme() || FALLBACK;
    applyTheme(initial); // synchronous — runs before first paint
    return initial;
  });

  // true while the transition overlay is showing
  const [transitioning, setTransitioning] = useState(false);

  const channelRef    = useRef(null);
  const inProgressRef = useRef(false); // guard against double-tap

  // ── Internal apply (no overlay) — used by remote syncs ───────────────────
  const _apply = (next) => {
    _setTheme(next);
    applyTheme(next);
    writeCookie(next);
  };

  // ── BroadcastChannel: same-browser cross-tab ──────────────────────────────
  // Empty dep array — channel lives for the full component lifetime so no
  // messages are ever dropped during a re-creation window.
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = ({ data }) => {
      if (data?.theme) _apply(data.theme);
    };
    return () => { ch.close(); channelRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Profile: cross-device sync on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function syncFromProfile() {
      try {
        const { supabase } = await import('../lib/supabaseClient.js');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id || cancelled) return;
        const { data: profile } = await supabase
          .from('profiles').select('theme_preference').eq('id', session.user.id).single();
        if (cancelled) return;
        const pref = profile?.theme_preference;
        if (pref && pref !== readCookie()) _apply(pref);
      } catch {}
    }
    syncFromProfile();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth state listener: re-sync on late sign-in ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    let authSub = null;
    async function listenForAuth() {
      try {
        const { supabase } = await import('../lib/supabaseClient.js');
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (cancelled) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user?.id) {
            const { data: profile } = await supabase
              .from('profiles').select('theme_preference').eq('id', session.user.id).single();
            if (cancelled) return;
            const pref = profile?.theme_preference;
            if (pref && pref !== readCookie()) _apply(pref);
          }
        });
        authSub = data.subscription;
      } catch {}
    }
    listenForAuth();
    return () => { cancelled = true; authSub?.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase Realtime: live cross-device sync ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let realtimeChannel = null;
    async function subscribeToProfileTheme() {
      try {
        const { supabase } = await import('../lib/supabaseClient.js');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id || cancelled) return;
        realtimeChannel = supabase
          .channel(`theme-sync:${session.user.id}`)
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
            (payload) => {
              if (cancelled) return;
              const pref = payload.new?.theme_preference;
              if (pref && pref !== readCookie()) {
                _apply(pref);
                channelRef.current?.postMessage({ theme: pref });
              }
            }
          )
          .subscribe();
      } catch {}
    }
    subscribeToProfileTheme();
    return () => { cancelled = true; realtimeChannel?.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── toggle — user-initiated, shows the transition overlay ─────────────────
  const toggle = async () => {
    if (inProgressRef.current) return;
    inProgressRef.current = true;

    const next = theme === 'dark' ? 'light' : 'dark';

    // 1. Show overlay — let the blur/fade fully land before touching the theme
    setTransitioning(true);
    await sleep(T_HOLD);

    // 2. Swap theme while the overlay is covering the screen
    _apply(next);
    channelRef.current?.postMessage({ theme: next });

    // 3. Hold a beat so the spinner has a moment of visibility post-swap
    await sleep(T_AFTER);

    // 4. Dismiss overlay (AnimatePresence handles the exit animation)
    setTransitioning(false);
    inProgressRef.current = false;

    // 5. Persist to profile — fire-and-forget, doesn't block UI
    try {
      const { supabase } = await import('../lib/supabaseClient.js');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        supabase.from('profiles').update({ theme_preference: next }).eq('id', session.user.id).then(() => {});
      }
    } catch {}
  };

  // ── programmatic setter (no overlay, for external use) ────────────────────
  const setTheme = (next) => {
    _apply(next);
    channelRef.current?.postMessage({ theme: next });
  };

  return (
    <ThemeCtx.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggle }}>
      {children}

      {/* ── Theme transition overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="theme-transition"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: T_BLUR_IN / 1000, ease: 'easeInOut' }}
            // Hardcoded black overlay — works regardless of source or target theme
            style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '1rem',
                padding: '1.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {/* Spinner */}
              <div style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.15)',
                borderTopColor: 'rgba(255,255,255,0.80)',
                animation: 'theme-spin 0.7s linear infinite',
              }} />
              {/* Label */}
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}>
                Refreshing…
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

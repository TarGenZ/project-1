import { createContext, useContext, useEffect, useRef, useState } from 'react';

// ── Shared theme context ───────────────────────────────────────────────────────
// Copied verbatim across every *.arpansarkar.org app.
//
// Priority on mount:
//   1. Cookie  → instant, zero-flash render on every page load
//   2. Profile → cross-device sync for logged-in users (async, overrides cookie)
//   3. prefers-color-scheme → fallback for brand-new visitors
//
// On toggle:
//   • Writes cookie (domain: .arpansarkar.org) so every other subdomain picks
//     it up on their next load
//   • Broadcasts via BroadcastChannel so every already-open tab/app updates
//     in real time without a reload
//   • Saves to profiles.theme_preference for cross-device persistence
// ─────────────────────────────────────────────────────────────────────────────

const COOKIE   = 'arpansarkar-theme';
const CHANNEL  = 'arpansarkar-theme-sync';
const FALLBACK = 'dark';

const ThemeCtx = createContext({ theme: FALLBACK, isDark: true, toggle: () => {} });

// ── helpers ───────────────────────────────────────────────────────────────────
function readCookie() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return m ? m[1] : null;
}

function writeCookie(value) {
  const age = 60 * 60 * 24 * 365; // 1 year
  document.cookie =
    `${COOKIE}=${value}; path=/; domain=.arpansarkar.org; max-age=${age}; SameSite=Lax`;
}

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value);
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ── provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, _setTheme] = useState(() => {
    const initial = readCookie() || systemTheme() || FALLBACK;
    applyTheme(initial);   // synchronous — runs before first paint
    return initial;
  });

  const channelRef = useRef(null);

  // ── BroadcastChannel: real-time same-browser cross-tab sync ──────────────
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    channelRef.current = ch;
    ch.onmessage = ({ data }) => {
      if (data?.theme && data.theme !== theme) {
        _setTheme(data.theme);
        applyTheme(data.theme);
        writeCookie(data.theme);
      }
    };
    return () => ch.close();
  }, [theme]);

  // ── Profile: cross-device sync for logged-in users ────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function syncFromProfile() {
      try {
        const { supabase } = await import('../lib/supabaseClient.js');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id || cancelled) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', session.user.id)
          .single();

        if (cancelled) return;
        const pref = profile?.theme_preference;
        if (pref && pref !== readCookie()) {
          _setTheme(pref);
          applyTheme(pref);
          writeCookie(pref);
        }
      } catch {
        // silently fall back to cookie value — never block the UI
      }
    }
    syncFromProfile();
    return () => { cancelled = true; };
  }, []);

  // ── toggle ────────────────────────────────────────────────────────────────
  const setTheme = async (next) => {
    _setTheme(next);
    applyTheme(next);
    writeCookie(next);
    channelRef.current?.postMessage({ theme: next });

    // Persist to profile (best-effort — don't await in the UI path)
    try {
      const { supabase } = await import('../lib/supabaseClient.js');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        supabase.from('profiles')
          .update({ theme_preference: next })
          .eq('id', session.user.id)
          .then(() => {}); // fire-and-forget
      }
    } catch {
      // silently ignore
    }
  };

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeCtx.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

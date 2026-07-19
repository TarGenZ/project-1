import { supabase } from '../lib/supabaseClient';

/**
 * AuthService — every Supabase Auth call the app makes, in one place.
 *
 * This is the client-side surface of the SHARED identity platform
 * (auth.users / profiles / Google OAuth / email auth all live in the one
 * Supabase project used by every *.arpansarkar.org app). Nothing in here
 * changes that backend contract — signatures and behavior are preserved
 * 1:1 from the previous implementation so existing users, sessions and
 * passwords keep working without any migration.
 *
 * Rule: this file (plus AuthProvider's single onAuthStateChange listener)
 * is the ONLY code allowed to call supabase.auth.* directly. Everything
 * else goes through useAuth().
 */

// ---------- Google OAuth ----------

/**
 * Kick off Google OAuth. `next` is where the user should land after the
 * callback finishes (defaults to wherever they started).
 * @param {string} [next]
 * @returns {Promise<void>}
 */
export async function signInWithGoogle(next = window.location.pathname) {
  try {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.signInWithGoogle] failed:', err.message);
    throw err;
  }
}

// ---------- Passwordless email OTP ----------

/**
 * Email sign-in/signup, step 1: send the email. The same email carries both
 * a clickable magic link (routes through /auth/callback) AND a
 * CODE_LENGTH-digit code (verified manually via verifyEmailOtp) — the
 * Supabase email template controls which pieces show up.
 * @param {string} email
 * @param {{next?: string, captchaToken?: string, data?: object, shouldCreateUser?: boolean}} [opts]
 * @returns {Promise<void>}
 */
export async function signInWithEmailOtp(
  email,
  { next = window.location.pathname, captchaToken, data, shouldCreateUser = true } = {}
) {
  try {
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const options = { emailRedirectTo, shouldCreateUser, captchaToken };
    if (data) options.data = data;
    const { error } = await supabase.auth.signInWithOtp({ email, options });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.signInWithEmailOtp] failed:', err.message);
    throw err;
  }
}

/**
 * Email sign-in, step 2 (only needed if the user types the code instead of
 * clicking the link). Resolves once the session is active.
 * @param {string} email
 * @param {string} token
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function verifyEmailOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error('[AuthService.verifyEmailOtp] failed:', err.message);
    throw err;
  }
}

// ---------- Password auth ----------
// Coexists with Google + passwordless OTP on the same account — Supabase
// doesn't force a single method per email. Accounts created before this
// feature shipped have no password until they go through "forgot password"
// once, which doubles as a way to add a password retroactively.

/**
 * Signup step 1: creates the user with a password, sends a confirmation
 * email. No session yet.
 * @param {string} email
 * @param {string} password
 * @param {{captchaToken?: string, data?: object}} [opts]
 * @returns {Promise<void>}
 */
export async function signUpWithPassword(email, password, { captchaToken, data } = {}) {
  try {
    const emailRedirectTo = `${window.location.origin}/auth/callback`;
    const options = { captchaToken, emailRedirectTo };
    if (data) options.data = data;
    const { error } = await supabase.auth.signUp({ email, password, options });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.signUpWithPassword] failed:', err.message);
    throw err;
  }
}

/**
 * Signup step 2: confirms the code from that email and activates the session.
 * @param {string} email
 * @param {string} token
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function verifySignupOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error('[AuthService.verifySignupOtp] failed:', err.message);
    throw err;
  }
}

/**
 * Direct password login. Throws with Supabase's own message on wrong
 * password/unknown email — the caller decides when to surface
 * "Forgot Password?" based on that.
 * @param {string} email
 * @param {string} password
 * @param {string} [captchaToken]
 * @returns {Promise<void>}
 */
export async function signInWithPassword(email, password, captchaToken) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.signInWithPassword] failed:', err.message);
    throw err;
  }
}

/**
 * Forgot-password step 1: emails a recovery code.
 * @param {string} email
 * @param {string} [captchaToken]
 * @returns {Promise<void>}
 */
export async function requestPasswordReset(email, captchaToken) {
  try {
    const redirectTo = `${window.location.origin}/auth/callback?next=/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { captchaToken, redirectTo });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.requestPasswordReset] failed:', err.message);
    throw err;
  }
}

/**
 * Forgot-password step 2: verifying the recovery code signs the user in
 * with a short-lived session, just enough to set a new password next.
 * @param {string} email
 * @param {string} token
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function verifyRecoveryOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error('[AuthService.verifyRecoveryOtp] failed:', err.message);
    throw err;
  }
}

/**
 * Forgot-password step 3: requires the recovery session from verifyRecoveryOtp.
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.updatePassword] failed:', err.message);
    throw err;
  }
}

/**
 * Sends a fresh code to an ALREADY-signed-in user (e.g. a first-time Google
 * sign-up we need to gate). shouldCreateUser: false because this user
 * already exists — we're just re-confirming their email.
 * @param {string} email
 * @param {string} [captchaToken]
 * @returns {Promise<void>}
 */
export async function sendVerificationCode(email, captchaToken) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, captchaToken },
    });
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.sendVerificationCode] failed:', err.message);
    throw err;
  }
}

/**
 * Call AFTER verifyEmailOtp() succeeds. The actual trust decision happens
 * server-side in the confirm_email_verification() Postgres function, which
 * checks Supabase's own record of a recent email confirmation rather than
 * taking the client's word for it.
 * @returns {Promise<boolean>}
 */
export async function confirmEmailVerification() {
  try {
    const { data, error } = await supabase.rpc('confirm_email_verification');
    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error('[AuthService.confirmEmailVerification] failed:', err.message);
    throw err;
  }
}

/**
 * Sign out and always land back on the main domain, per spec.
 * @returns {Promise<void>}
 */
export async function signOutEverywhere() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.signOutEverywhere] failed:', err.message);
    // Still send the user home even if the network call failed — a stuck
    // "signed in" UI is worse than a redirect with a possibly-stale token.
  } finally {
    window.location.href = 'https://arpansarkar.org';
  }
}

// ---------- Session / profile ----------
// getSession() below exists for the one-time initial check. Do NOT call it
// from components — AuthProvider is the only place that should. Everything
// else reads session from useAuth().

/**
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error('[AuthService.getSession] failed:', err.message);
    throw err;
  }
}

/**
 * Fetches a profile row. Returns null both when the row genuinely doesn't
 * exist yet (maybeSingle — no throw) and on unexpected errors (logged).
 * Callers that need to distinguish "doesn't exist" from "failed" should use
 * ensureProfile() instead.
 * @param {string} userId
 * @returns {Promise<import('./authTypes').Profile|null>}
 */
export async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, class_level, is_admin, is_verified, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[AuthService.getProfile] failed:', err.message);
    return null;
  }
}

/**
 * Fetches the profile for a user, creating it automatically if it doesn't
 * exist yet (e.g. a brand-new Google sign-up whose trigger hasn't run, or
 * ran before this column existed). Never throws — a profile problem should
 * never crash the app; it returns null on unrecoverable failure and the
 * caller falls back to treating the user as "no profile yet".
 * @param {import('@supabase/supabase-js').User} user
 * @returns {Promise<import('./authTypes').Profile|null>}
 */
export async function ensureProfile(user) {
  if (!user?.id) return null;
  try {
    const existing = await getProfile(user.id);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? null,
      })
      .select('id, full_name, email, class_level, is_admin, is_verified, created_at')
      .single();

    if (error) {
      // Most likely a benign race (another tab/listener already inserted
      // the row) — re-fetch once rather than treating it as fatal.
      console.error('[AuthService.ensureProfile] insert failed, re-fetching:', error.message);
      return await getProfile(user.id);
    }
    return data;
  } catch (err) {
    console.error('[AuthService.ensureProfile] failed:', err.message);
    return null;
  }
}

/**
 * Lets a signed-in user override their own display name (e.g. a Google
 * sign-up editing the name Google supplied). RLS restricts this to the
 * caller's own row; is_admin is separately protected by a DB trigger.
 * @param {string} userId
 * @param {string} fullName
 * @returns {Promise<void>}
 */
export async function updateProfileName(userId, fullName) {
  try {
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
    if (error) throw error;
  } catch (err) {
    console.error('[AuthService.updateProfileName] failed:', err.message);
    throw err;
  }
}

/**
 * The one-time onboarding step, asked together in a single popup for both
 * email and Google sign-ups: name + class. full_name can only ever be set
 * once (enforced by the protect_profile_columns DB trigger); class_level
 * is left freely editable since a student's year changes.
 * @param {string} userId
 * @param {{fullName: string, classLevel: string}} data
 * @returns {Promise<import('./authTypes').Profile>}
 */
export async function completeOnboarding(userId, { fullName, classLevel }) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, class_level: classLevel })
      .eq('id', userId)
      .select('id, full_name, email, class_level, is_admin, is_verified, created_at')
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[AuthService.completeOnboarding] failed:', err.message);
    throw err;
  }
}

/**
 * Low-level subscription wrapper. INTERNAL — AuthProvider is the only
 * caller. Every other component must read session state from useAuth()
 * instead of subscribing again, or SSO state can drift between listeners.
 * @param {(session: import('@supabase/supabase-js').Session|null, event: string) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthStateChange(callback) {
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event);
  });
  return () => listener.subscription.unsubscribe();
}

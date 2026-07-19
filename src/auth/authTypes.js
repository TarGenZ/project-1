/**
 * Shared type definitions and constants for the auth system.
 * Plain JSDoc (this project is JS, not TS) so editors still get
 * autocomplete/type-checking without adding a build step.
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string|null} full_name
 * @property {string} email
 * @property {string|null} class_level
 * @property {boolean} is_admin
 * @property {boolean} is_verified
 * @property {string} created_at
 */

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 * @typedef {import('@supabase/supabase-js').User} User
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user
 * @property {Session|null} session
 * @property {Profile|null} profile
 * @property {boolean} loading            - true until the first session check resolves
 * @property {boolean} profileLoading      - true while the profile for the current session is being fetched
 * @property {boolean} isAuthenticated
 * @property {boolean} isAdmin
 * @property {boolean} needsEmailVerification
 * @property {boolean} needsOnboarding    - true when name and/or class haven't been set yet
 * @property {() => Promise<void>} refreshProfile
 * @property {() => Promise<void>} signOut
 */

// Length of the numeric code Supabase emails for signup / passwordless / recovery OTPs.
export const CODE_LENGTH = 8;

// The `type` values Supabase's verifyOtp() expects — kept in one place so a
// typo can't silently break one flow.
export const OTP_TYPE = {
  SIGNUP: 'signup',
  EMAIL: 'email',
  RECOVERY: 'recovery',
};

// Matches the `class_level` CHECK constraint on profiles — keep in sync
// with the SQL migration.
export const CLASS_LEVELS = [
  { value: '11th', label: '11th' },
  { value: '12th', label: '12th' },
  { value: 'drop_1', label: '1st Drop' },
  { value: 'drop_2', label: '2nd Drop' },
  { value: 'drop_3_plus', label: '3+ Drop' },
];

export {};

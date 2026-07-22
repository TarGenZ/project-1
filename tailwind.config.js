/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // These three drive the entire light/dark switch.
        // They read from CSS variables so [data-theme="light"] overrides in
        // index.css flip every bg-base, bg-panel, border-line etc. automatically.
        // The `/ <alpha-value>` syntax preserves Tailwind's opacity modifiers
        // (bg-base/90, border-line/70 …) — no component rewrites needed.
        base:   'rgb(var(--color-base)   / <alpha-value>)',
        panel:  'rgb(var(--color-panel)  / <alpha-value>)',
        line:   'rgb(var(--color-line)   / <alpha-value>)',
        // lavender flips to a darker shade in light mode so it stays readable
        lavender: 'rgb(var(--color-lavender) / <alpha-value>)',
        violet: {
          DEFAULT: '#7C3AED',
          soft:    '#9061F9',
        },
        amber: '#F59E0B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'omr-grid':
          'radial-gradient(circle at 1px 1px, rgba(var(--color-grid-dot)) 1px, transparent 0)',
      },
      backgroundSize: {
        omr: '28px 28px',
      },
      boxShadow: {
        glow:      '0 0 40px rgba(124, 58, 237, 0.35)',
        amberGlow: '0 0 30px rgba(245, 158, 11, 0.3)',
      },
      keyframes: {
        fillIn: {
          '0%':   { strokeDashoffset: '340' },
          '100%': { strokeDashoffset: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fillIn:    'fillIn 1.4s ease-out forwards',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0F1E',
        panel: '#10162B',
        line: '#1E2540',
        violet: {
          DEFAULT: '#7C3AED',
          soft: '#9061F9',
        },
        lavender: '#C4B5FD',
        amber: '#F59E0B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'omr-grid':
          'radial-gradient(circle at 1px 1px, rgba(196,181,253,0.08) 1px, transparent 0)',
      },
      backgroundSize: {
        omr: '28px 28px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.35)',
        amberGlow: '0 0 30px rgba(245, 158, 11, 0.3)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

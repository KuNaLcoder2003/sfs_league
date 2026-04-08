/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1a472a',
          greenlt: '#2d6a4f',
          greendark: '#0d2b18',
          gold: '#f4a81d',
          golddark: '#c47d0a',
        },
      },
      fontFamily: {
        display: ['"Georgia"', 'serif'],
      },
      animation: {
        'score-pop': 'scorePop 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
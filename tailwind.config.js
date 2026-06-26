/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          900: '#232e16',
          800: '#2c3a1e',
          700: '#3f5226',
        },
        lime: {
          DEFAULT: '#9dbf1e',
          soft: '#b9d24e',
        },
        gold: {
          DEFAULT: '#c8920a',
          bright: '#e8a100',
          glow: '#f2b705',
        },
        terra: '#d96a1e',
        ivory: {
          DEFAULT: '#fbf8f1',
          2: '#f3ede0',
        },
        cream: '#e6dfce',
        ink: {
          DEFAULT: '#20251a',
          soft: '#5e5f50',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1240px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        scrollLine: { '0%': { transform: 'translateX(-100%)' }, '60%,100%': { transform: 'translateX(100%)' } },
        pulse: { '0%,100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.06)', opacity: '0.8' } },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
        scrollLine: 'scrollLine 2.2s cubic-bezier(0.22,1,0.36,1) infinite',
        'crest-pulse': 'pulse 1.8s cubic-bezier(0.22,1,0.36,1) infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './admin.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#171f0f',
          900: '#212b17',
          800: '#2c3a1e',
          700: '#3f5226',
          600: '#587039',
          100: '#e5ebd8',
          50: '#f2f5ea',
        },
        lime: {
          DEFAULT: '#9dbf1e',
          soft: '#b9d24e',
        },
        gold: {
          DEFAULT: '#8c6709',
          bright: '#d9a521',
          glow: '#eebf4d',
        },
        terra: '#b4501a',
        sindoor: '#a3301f',
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
        serif: ['Cormorant', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1360px',
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-green': {
          50: '#F3F9F6',
          100: '#E6F2EC',
          200: '#D1E6DB',
          300: '#B7DAC8',
          400: '#9CCDB4',
          500: '#8EC4A7',
          600: '#6EAA8C',
          700: '#4F8F73',
          800: '#356D57',
          900: '#255844',
          DEFAULT: '#8EC4A7',
          light: '#E6F2EC',
          dark: '#4F8F73',
        },
      },
    },
  },
  plugins: [],
};

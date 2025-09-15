/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-green': '#8EC4A7',
        'brand-green-dark': '#6EAA8C',
        'brand-green-light': '#E6F2EC',
      },
    },
  },
  plugins: [],
};

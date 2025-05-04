/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // THIS is crucial
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
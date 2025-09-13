/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-surface': '#FFFFFF', // Light surface color
        'dark-surface': '#0F172A', // Dark surface color
      },
    },
  },
  plugins: [],
};
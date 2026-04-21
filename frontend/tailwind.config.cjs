/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oxanium', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        cyber: {
          50: '#f0feff',
          100: '#ccfbff',
          200: '#99f6ff',
          300: '#5ee7ff',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(34, 211, 238, 0.18), 0 0 42px rgba(34, 211, 238, 0.22)',
        panel: '0 28px 90px rgba(2, 8, 23, 0.55)',
      },
    },
  },
  plugins: [],
};

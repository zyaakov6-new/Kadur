/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#007AFF', // Main primary blue
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        football: {
          50: '#e8f9ed',
          100: '#b8edc8',
          200: '#88e1a3',
          300: '#58d57e',
          400: '#34C759', // Football green
          500: '#2ca84a',
          600: '#24893c',
          700: '#1c6a2e',
          800: '#144b20',
          900: '#0c2c12',
        },
        dark: {
          bg: '#0F0F23',
          card: '#1A1A2E',
          border: '#2A2A3E',
          text: '#E4E4E7',
          muted: '#71717A',
        },
        light: {
          bg: '#F8F9FA',
          card: '#FFFFFF',
          border: '#E5E5EA',
          text: '#1C1C1E',
          muted: '#8E8E93',
        },
      },
      fontFamily: {
        sans: ['System'],
        hebrew: ['System'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '10px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.15)',
        button: '0 2px 8px rgba(0, 122, 255, 0.3)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // D&D Fantasy Theme Colors
        parchment: {
          50: '#fdfcf6',
          100: '#faf7ed',
          200: '#f4efd8',
          300: '#ede7c3',
          400: '#e6dfae',
          500: '#dfd799',
          600: '#b3ac7a',
          700: '#86815b',
          800: '#59563d',
          900: '#2d2b1e',
        },
        ink: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        leather: {
          50: '#faf8f3',
          100: '#f5f1e7',
          200: '#ebe3cf',
          300: '#d4c5a3',
          400: '#bda777',
          500: '#9f8454',
          600: '#8a6f46',
          700: '#72593a',
          800: '#604b33',
          900: '#52402e',
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

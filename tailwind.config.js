/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FBF9F4',
          100: '#F3EEE0',
          200: '#E7DFC9',
          300: '#D8CBA8',
        },
        pine: {
          600: '#2F4F3E',
          700: '#25402F',
          800: '#1B2F22',
        },
        saffron: {
          400: '#E0A526',
          500: '#C8901A',
          600: '#A8760F',
        },
        ink: {
          600: '#3C3A33',
          700: '#2A2822',
          800: '#1E1C17',
        },
        brick: {
          500: '#B54B3A',
          600: '#9B3D2F',
        },
        room: {
          free: '#2F8F5B',
          freeDark: '#1F6B41',
          occupied: '#C1443A',
          occupiedDark: '#9B342C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        np: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          600: "#2F4F3E",
          700: "#25402F",
          800: "#1B2F22",
        },
        room: {
          free: "#2F8F5B",
          freeDark: "#1F6B41",
          occupied: "#DC2626",
          occupiedDark: "#991B1B",
        },
      },
      fontFamily: {
        display: ['"Inter"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        np: ['"Noto Sans Devanagari"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

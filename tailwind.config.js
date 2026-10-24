/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          50: "#F1F7F3",
          100: "#DDECE1",
          300: "#9CC5A7",
          600: "#326047",
          700: "#234A35",
          800: "#173326",
          900: "#0E241A",
        },
        saffron: {
          100: "#FFF3D6",
          500: "#C58B22",
          600: "#A86F12",
        },
        room: {
          free: "#2F8F5B",
          freeDark: "#1F6B41",
          occupied: "#DC2626",
          occupiedDark: "#991B1B",
        },
      },
      fontFamily: {
        display: ['"DM Sans"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
        np: ['"Noto Sans Devanagari"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

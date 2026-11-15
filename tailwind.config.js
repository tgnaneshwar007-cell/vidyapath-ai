/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          storm: {
            DEFAULT: "#747D87",
            light: "#8E97A1",
            dark: "#4E555C",
            subtle: "#F0F2F4",
          },
          black: {
            DEFAULT: "#17191C",
            soft: "#23272C",
            muted: "#363C44",
          },
          orange: {
            DEFAULT: "#F47B20",
            hover: "#DE6A12",
            subtle: "#FFF4ED",
            muted: "#FC9C54",
          },
          warmWhite: "#F5F4F0",
          surface: "#FFFFFF",
          mutedText: "#69717A",
          border: "#DCE0E3",
          borderFocus: "#747D87",
          success: {
            DEFAULT: "#26734D",
            subtle: "#EDF7F1",
          },
          danger: {
            DEFAULT: "#B83C32",
            subtle: "#FDF2F1",
          },
          warning: {
            DEFAULT: "#C07000",
            subtle: "#FFF8ED",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Times New Roman'", "Times", "Georgia", "serif"],
        serif: ["'Times New Roman'", "Times", "Georgia", "serif"],
        mono: ["Geist Mono", "monospace"],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(23, 25, 28, 0.04)',
        'card': '0 2px 4px 0 rgba(23, 25, 28, 0.05), 0 1px 2px -1px rgba(23, 25, 28, 0.04)',
        'glass': '0 8px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 25px -5px rgba(23, 25, 28, 0.08), 0 8px 10px -6px rgba(23, 25, 28, 0.04)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

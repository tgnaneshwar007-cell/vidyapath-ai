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
        sans: ["Geist Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Geist Sans", "Inter", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(23, 25, 28, 0.05)',
        'card': '0 1px 3px 0 rgba(23, 25, 28, 0.08), 0 1px 2px -1px rgba(23, 25, 28, 0.08)',
        'elevated': '0 4px 6px -1px rgba(23, 25, 28, 0.08), 0 2px 4px -2px rgba(23, 25, 28, 0.06)',
      },
    },
  },
  plugins: [],
}

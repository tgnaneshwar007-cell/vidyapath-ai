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
          warmWhite: "#F8F9FA",
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
        sans: ["'Geist Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        display: ["'Geist Sans'", "'Inter'", "-apple-system", "sans-serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.035em",
        tight: "-0.02em",
        normal: "0em",
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(23, 25, 28, 0.04)',
        'card': '0 2px 4px 0 rgba(23, 25, 28, 0.05), 0 1px 2px -1px rgba(23, 25, 28, 0.04)',
        'glass': '0 8px 32px 0 rgba(23, 25, 28, 0.06), 0 1px 2px rgba(255, 255, 255, 0.8) inset',
        'glass-hover': '0 14px 36px -4px rgba(23, 25, 28, 0.1), 0 1px 2px rgba(255, 255, 255, 0.9) inset',
        'elevated': '0 10px 25px -5px rgba(23, 25, 28, 0.08), 0 8px 10px -6px rgba(23, 25, 28, 0.04)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

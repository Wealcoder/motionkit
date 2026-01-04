/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "src/modules/animation-builder/**/*.{js,jsx}",
    "src/modules/animation-builder/components/**/*.{js,jsx}",
    "src/assets/icons.jsx",
  ],
  prefix: "",
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      fontSize: {
        15: "0.9375rem",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "var(--background)",
          hover: "var(--background-hover)",
          disable: "var(--background-disable)",
          sidebar: "var(--background-sidebar)",
          card: "var(--card-background)",
        },
        button: {
          default: "var(--btn-background)",
          action: "var(--btn-bg-action)",
          cancel: "var(--btn-bg-cancel)",
          rd: "var(--btn-bg-responsive-device)",
        },
        borderRadius: {
          btn: "5px",
        },
      },
      borderRadius: {
        5: "0.3125rem",
      },
    },
  },
  plugins: [],
};

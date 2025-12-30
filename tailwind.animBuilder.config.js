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
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "var(--background)",
          hover: "var(--background-hover)",
          disable: "var(--background-disable)",
        },
        text: {
          default: "var(--text-default)",
          // hover: "var(--text-hover)",
          // disable: "var(--text-disable)",
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
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */

// for testing purpose
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: ["class"],
  content: [
    "src/modules/animation-builder/**/*.{js,jsx}",
    "src/assets/icons.jsx",
  ],
  prefix: "",
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      colors: {
        foreground: "var(--foreground)",
        background: {
          sidebar: "var(--background-primary)",
          topbar: "var(--background-secondary)",
        },
        button: {
          DEFAULT: "var(--button-primary)",
          hover: "var(--button-primary-hover)",
          focus: "var(--button-primary-active)",
          action: "var(--accent-primary)",
          "action-hover": "var(--accent-primary-hover)",
          "action-focus": "var(--accent-primary-active)",
          destructive: "var(--accent-secondary)",
          "destructive-hover": "var(--accent-secondary-hover)",
          "destructive-focus": "var(--accent-secondary-active)",
        },
        input: {
          DEFAULT: "var(--input-primary)",
          hover: "var(--input-primary-hover)",
          focus: "var(--input-primary-focus)",
        },
        switch: {
          DEFAULT: "var(--switch-primary)",
          active: "var(--switch-primary-active)",
          thumb: "var(--switch-track)",
          "thumb-active": "var(--switch-track)",
        },
        select: {
          DEFAULT: "var(--select-primary)",
          hover: "var(--select-primary-hover)",
          active: "var(--select-primary-active)",
          secondary: "var(--select-secondary)",
          color: "var(--text-select-color)",
        },
        sidebar: {
          DEFAULT: "var(--background-primary)",
          foreground: "var(--foreground)",
          primary: "var(--background-primary)",
          "primary-foreground": "var(--foreground)",
          accent: "var(--accent-primary)",
          "accent-foreground": "var(--foreground)",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        popover: {
          DEFAULT: "var(--popover)",
        },
      },
      fontFamily: {
        inter: "Inter, sans-serif",
      },
      fontSize: {
        label: "0.75rem",
        placeholder: "0.7188rem",
        "input-font-size": "0.7188rem",
        "button-font-size": "0.7188rem",
        "button-icon-size": "1rem",
        "select-font-size": "0.7188rem",
      },
      borderRadius: {
        5: "0.3125rem",
      },
      lineHeight: {
        18: "1.125rem",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-red-dev": {
          border: "2px solid red",
        },
        ".border-white-dev": {
          border: "2px solid white",
        },
      });
    }),
  ],
};
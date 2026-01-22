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
          sidebar: "var(--sidebar)",
          topbar: "var(--topbar)",
        },
        button: {
          DEFAULT: "var(--button-primary)",
          hover: "var(--button-primary-hover)",
          focus: "var(--button-primary-active)",
          action: "var(--button-action)",
          "action-hover": "var(--button-action-hover)",
          "action-focus": "var(--button-action-active)",
          destructive: "var(--button-destructive)",
          "destructive-hover": "var(--button-destructive-hover)",
          "destructive-focus": "var(--button-destructive-active)",
          color: "var(--text-button-color)",
          "hover-color": "var(--text-button-color-hover)",
          "focus-color": "var(--text-button-color-active)",
        },
        input: {
          DEFAULT: "var(--background-input)",
          hover: "var(--background-input-hover)",
          focus: "var(--background-input-focus)",
          color: "var(--text-input-color)",
          "hover-color": "var(--text-input-color-hover)",
          "focus-color": "var(--text-input-color-active)",
        },
        switch: {
          DEFAULT: "var(--switch-button-primary)",
          active: "var(--switch-button-primary-active)",
          thumb: "var(--switch-button-track)",
          "thumb-active": "var(--switch-button-track)",
        },
        select: {
          DEFAULT: "var(--select-primary)",
          secondary: "var(--select-secondary)",
          color: "var(--text-select-color)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        popover: {
          DEFAULT: "var(--popover)",
        },
        border: "transparent",
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

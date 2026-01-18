/** @type {import('tailwindcss').Config} */

// for testing purpose
const plugin = require("tailwindcss/plugin");

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
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--foreground)", // for text
        },

        background: {
          DEFAULT: "var(--background)",
          sidebar: "var(--sidebar)",
          topbar: "var(--topbar)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        button: {
          primary: "var(--button-primary)",
          "primary-hover": "var(--button-primary-hover)",
          "primary-active": "var(--button-primary-active)",
          action: "var(--button-action)",
          "action-hover": "var(--button-action-hover)",
          "action-active": "var(--button-action-active)",
          destructive: "var(--button-destructive)",
          "destructive-hover": "var(--button-destructive-hover)",
          "destructive-active": "var(--button-destructive-active)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },

        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "5px",
        sm: "4px",
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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

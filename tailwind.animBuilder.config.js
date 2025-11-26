/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "src/modules/animation-builder/components/**/*.{js,jsx}",
    "src/modules/animation-builder/GetStart.jsx",
    "src/modules/animation-builder/lib/icons.jsx",
  ],
  prefix: "",
  important: ".wcfab2025",
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        border: {
          2: "hsl(var(--border-2))",
          DEFAULT: "hsl(var(--border))",
          active: "hsl(var(--border-active))",
        },
        input: "hsl(var(--input))",
        background: {
          DEFAULT: "hsl(var(--background))",
          hover: "hsl(var(--background-hover))",
          disable: "hsl(var(--background-disable))",
        },
        text: {
          2: "hsl(var(--text-2))",
          3: "hsl(var(--text-3))",
          DEFAULT: "hsl(var(--text))",
        },
        placeholder: "hsl(var(--placeholder))",
        button: {
          primary: {
            DEFAULT: "hsl(var(--button-primary))",
            hover: "hsl(var(--button-primary-hover))",
          },
          secondary: {
            DEFAULT: "hsl(var(--button-secondary))",
            hover: "hsl(var(--button-secondary-hover))",
          },
          tertiary: {
            DEFAULT: "hsl(var(--button-tertiary))",
            hover: "hsl(var(--button-tertiary-hover))",
          },
        },
        dropdown: {
          hover: "hsl(var(--dropdown-hover))",
        },
      },
      backgroundImage: {
        "play-button": "linear-gradient(0deg, #3F444B 0%, #4B5057 100%)",
        "play-button-hover": "linear-gradient(0deg, #494E56 0%, #565C65 100%)",
      },
      boxShadow: {
        switch:
          "0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        select: "0px 6px 40px 0px rgba(0, 0, 0, 0.50)",
        tooltip: "0px 6px 20px -4px rgba(18, 20, 29, 0.50)",
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
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      addUtilities({
        ".no-spinner": {
          "&::-webkit-inner-spin-button": { appearance: "none", margin: "0" },
          "&::-webkit-outer-spin-button": { appearance: "none", margin: "0" },
          "&": { MozAppearance: "textfield", appearance: "textfield" },
        },
      });
    },
  ],
};

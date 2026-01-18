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
  			'15': '0.9375rem'
  		},
  		fontFamily: {
  			inter: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		colors: {
  			background: {
  				DEFAULT: 'var(--background)',
  				hover: 'var(--background-hover)',
  				disable: 'var(--background-disable)',
  				sidebar: 'var(--background-sidebar)',
  				card: 'var(--card-background)',
  				input: 'var(--background-input)'
  			},
  			button: {
  				primary: 'var(--btn-primary)',
  				'primary-hover': 'var(--btn-primary-hover)',
  				action: 'var(--btn-bg-action)',
  				'action-hover': 'var(--btn-bg-action-hover)',
  				cancel: 'var(--btn-bg-cancel)',
  				'cancel-hover': 'var(--btn-bg-cancel-hover)'
  			},
  			input: {
  				DEFAULT: 'var(--background-input)',
  				hover: 'var(--background-input-hover)',
  				focus: 'var(--background-input-focus)',
  				placeholder: 'var(--text-input)',
  				'text-hover': 'var(--text-input-hover)',
  				'text-focus': 'var(--text-input-focus)'
  			},
  			popover: {
  				DEFAULT: 'var(--background-popover)',
  				foreground: 'var(--text-popover-foreground)'
  			},
  			slider: {
  				DEFAULT: 'var(--bg-slider-track)',
  				thumb: 'var(--bg-slider-thumb)'
  			}
  		},
  		borderRadius: {
  			'5': '0.3125rem'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
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
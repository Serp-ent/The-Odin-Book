const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: colors.gray[100],  // Background for light mode
          dark: colors.gray[900],   // Background for dark mode
        },
        text: {
          primary: {
            light: colors.gray[900], // Primary text in light mode
            dark: colors.gray[100],  // Primary text in dark mode
          },
          secondary: {
            light: colors.gray[600], // Secondary text in light mode
            dark: colors.gray[400],  // Secondary text in dark mode
          },
        },
        primary: {
          light: colors.indigo[600], // Primary color in light mode
          dark: colors.indigo[400],  // Primary color in dark mode
        },
        secondary: {
          light: colors.yellow[500], // Secondary color in light mode
          dark: colors.yellow[400],  // Secondary color in dark mode
        },
        accent: {
          light: colors.blue[500],   // Accent color in light mode
          dark: colors.blue[400],    // Accent color in dark mode
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
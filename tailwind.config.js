/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0f5551",
        "primary-container": "#2f6d69",
        "on-primary": "#ffffff",
        "on-primary-container": "#aeece7",
        "secondary": "#785919",
        "secondary-container": "#fed488",
        "lagunita-gold": "#C6A059",
        "tertiary": "#3d503e",
        "background": "#fbf9f6",
        "surface": "#fbf9f6",
        "surface-container-low": "#f5f3f0",
        "surface-container": "#efeeeb",
        "surface-container-high": "#eae8e5",
        "surface-container-highest": "#e4e2df",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1b1c1a",
        "on-surface-variant": "#3f4947",
        "outline": "#6f7978",
        "outline-variant": "#bfc8c7",
        "error": "#ba1a1a",
        "secondary-fixed": "#ffdea6",
        "primary-fixed": "#b0eee9",
      },
      fontFamily: {
        serif: ["EB Garamond", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        'margin-mobile': '16px',
        'safety-area': '16px',
      }
    },
  },
  plugins: [],
}

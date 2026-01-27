/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#006b3f",
        "background-light": "#f0f4f8",
        "background-dark": "#0f172a",
        "road-light": "#334155",
        "road-dark": "#1e293b",
        "sign-white": "#ffffff",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        'pole': '2px 0 5px rgba(0,0,0,0.3)',
        'sign': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // your React source
    "./index.html", // Vite entry
    "./public/**/*.html", // just in case
    "./dist/**/*.js", // ensure built extension files are scanned
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
      },
      colors: {
        "cue-blue": "#3b82f6",
        "cue-green": "#10b981",
        "cue-purple": "#8b5cf6",
        "cue-orange": "#f59e0b",
        "cue-indigo": "#6366f1",
      },
      boxShadow: {
        overlay:
          "0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "spin-slow": "spin 1s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  corePlugins: {
    preflight: false, // disable base reset so you don't override host page styles
  },
};

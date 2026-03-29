/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          "pulse-slow": "pulseSlow 2.5s ease-in-out infinite",
        },
        keyframes: {
          pulseSlow: {
            "0%, 100%": { opacity: 0.3 },
            "50%": { opacity: 0.8 },
          },
        },
      },
    },
    plugins: [],
  };
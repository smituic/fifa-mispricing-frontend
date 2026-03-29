/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
        },
        keyframes: {
          glowPulse: {
            "0%, 100%": {
              transform: "scale(0.8)",
              opacity: "0.3",
            },
            "50%": {
              transform: "scale(1.4)",
              opacity: "0.8",
            },
          },
        },
    },
    plugins: [],
}};
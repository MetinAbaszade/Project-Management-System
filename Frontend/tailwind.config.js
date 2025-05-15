const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}", 
    "./components/**/*.{ts,tsx}" 
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 0 2px var(--primary), 0 0 10px var(--primary)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  darkMode: false, // 👈 keeps things neutral, does NOT force anything

  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--primary": "#3B82F6",
          "--background": "#F9FAFB",
          "--foreground": "#111827",
          "--muted": "#E5E7EB",
        },

        // You can layer in themes like this (e.g., via body class)
        ".theme-dark": {
          "--primary": "#3B82F6",
          "--background": "#0f0f0f",
          "--foreground": "#f9f9f9",
          "--muted": "#2a2a2a",
        },

        ".theme-ocean": {
          "--primary": "#0ea5e9",
          "--background": "#e0f7fa",
          "--foreground": "#0f172a",
          "--muted": "#bae6fd",
        },

        ".theme-sunset": {
          "--primary": "#f97316",
          "--background": "#fff7ed",
          "--foreground": "#3b0d0c",
          "--muted": "#fed7aa",
        },

        ".theme-forest": {
          "--primary": "#16a34a",
          "--background": "#ecfdf5",
          "--foreground": "#052e16",
          "--muted": "#bbf7d0",
        },
      });
    }),
  ],
};

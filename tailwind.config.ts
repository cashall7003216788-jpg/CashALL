import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD400",
          yellowHover: "#E6BE00",
          black: "#050505",
          dark: "#111111",
          cardDark: "#181818",
          bg: "#F7F7F5",
          border: "#E7E7E7",
          muted: "#6B6B6B",
          success: "#16A34A",
          error: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
        yellowGlow: "0 10px 25px -5px rgba(255, 212, 0, 0.35)",
        subtleCard: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

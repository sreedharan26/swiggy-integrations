import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Swiggy orange family
          DEFAULT: "#FC8019",
          50: "#FFF4EB",
          100: "#FFE6D1",
          500: "#FC8019",
          600: "#E36C0A",
          700: "#B85608",
        },
        leaf: {
          // fresh green accent
          DEFAULT: "#1BA672",
          50: "#E9F8F1",
          100: "#CDEFE0",
          500: "#1BA672",
          600: "#15875D",
        },
        ink: {
          DEFAULT: "#1C1C1C",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

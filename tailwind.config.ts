import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
 ],
  theme: {
    extend: {
      colors: {
        void: "#070A0F",
        panel: "#0B0F17",
        gold: {
          DEFAULT: "#D4A843",
          hover: "#E8C15F",
          dim: "#B8860B",
        },
        emerald: "#10B981",
        cyan: {
          DEFAULT: "#22D3EE",
        },
        slate: {
          950: "#070A0F",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        gold: "0 0 24px rgba(212,168,67,0.25)",
        "gold-lg": "0 0 40px rgba(212,168,67,0.15)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #E8C15F, #D4A843, #B8860B)",
      },
      keyframes: {
        "pulse-emerald": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "pulse-cyan": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "float-particle": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100px) translateX(20px)", opacity: "0" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.3" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)", opacity: "0.5" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)", opacity: "0.4" },
        },
        "typing-dot": {
          "0%, 20%": { opacity: "0.2" },
          "50%": { opacity: "1" },
          "80%, 100%": { opacity: "0.2" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-rtl": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 78%)" },
        },
      },
      animation: {
        "pulse-emerald": "pulse-emerald 2s ease-in-out infinite",
        "pulse-cyan": "pulse-cyan 2s ease-in-out infinite",
        "float-particle": "float-particle 8s ease-in-out infinite",
        aurora: "aurora 12s ease-in-out infinite",
        "typing-dot": "typing-dot 1.4s ease-in-out infinite",
        "slide-in-up": "slide-in-up 0.5s ease-out forwards",
        marquee: "marquee 30s linear infinite",
        "marquee-rtl": "marquee-rtl 30s linear infinite",
        "progress-fill": "progress-fill 2s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
